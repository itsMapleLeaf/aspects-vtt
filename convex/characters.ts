import type { WithoutSystemFields } from "convex/server"
import { ConvexError, v } from "convex/values"
import { Effect, pipe } from "effect"
import { compact } from "lodash-es"
import { match } from "ts-pattern"
import {
	getAttributeDie,
	normalizeCharacterAttributes,
} from "~/features/characters/helpers.ts"
import { DEFAULT_WEALTH_TIER } from "~/features/characters/wealth.ts"
import { Doc, type Id } from "./_generated/dataModel"
import { InaccessibleError, ensureUserId, getAuthUserId } from "./auth.ts"
import {
	effectMutation,
	effectQuery,
	getQueryCtx,
	queryEnt,
} from "./lib/effects.ts"
import {
	EntQueryCtx,
	mutation,
	type Ent,
	type EntMutationCtx,
} from "./lib/ents.ts"
import { partial } from "./lib/validators.ts"
import { isRoomOwner } from "./rooms.ts"
import schema from "./schema.ts"

export const get = effectQuery({
	args: {
		characterId: v.id("characters"),
	},
	handler(ctx, args) {
		return pipe(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				const ent = yield* queryEnt(
					ctx.table("characters").get(args.characterId),
				)
				return yield* protectCharacterEnt(ent, userId)
			}),
			Effect.orElseSucceed(() => null),
		)
	},
})

export const list = effectQuery({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)

			let query
			if (args.search) {
				query = ctx
					.table("characters")
					.search("name", (q) =>
						q.search("name", args.search!).eq("roomId", args.roomId),
					)
			} else {
				query = ctx.table("characters", "roomId", (q) =>
					q.eq("roomId", args.roomId),
				)
			}

			return yield* pipe(
				Effect.promise(() => query),
				Effect.flatMap(
					Effect.forEach((ent) => protectCharacterEnt(ent, userId)),
				),
				Effect.map(compact),
			)
		}).pipe(Effect.orElseSucceed(() => []))
	},
})

export const create = effectMutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		roomId: v.id("rooms"),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)
			return yield* createCharacter(ctx, userId, args)
		}).pipe(Effect.orDie)
	},
})

export const update = mutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		characterId: v.id("characters"),
		aspectSkills: v.optional(
			v.object({
				add: v.optional(v.string()),
				remove: v.optional(v.string()),
			}),
		),
	},
	async handler(ctx, { characterId, aspectSkills, ...props }) {
		const userId = await ensureUserId(ctx)
		const character = await ctx.table("characters").getX(characterId)
		const room = await character.edgeX("room")

		const isCharacterAdmin =
			room.ownerId === userId ||
			character.playerId === userId ||
			character.ownerId === userId

		if (!isCharacterAdmin) {
			throw new ConvexError("Unauthorized")
		}

		const newAspectSkills = { ...character.aspectSkills }
		if (aspectSkills?.add) {
			newAspectSkills[aspectSkills.add] = aspectSkills.add
		}
		if (aspectSkills?.remove) {
			delete newAspectSkills[aspectSkills.remove]
		}

		return normalizeCharacter(
			await character
				.patch({ ...props, aspectSkills: newAspectSkills })
				.get()
				.doc(),
		)
	},
})

export const updateMany = effectMutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		characterId: v.optional(v.id("characters")),
		aspectSkills: v.optional(
			v.object({
				add: v.optional(v.string()),
				remove: v.optional(v.string()),
			}),
		),
		updates: v.optional(
			v.array(
				v.object({
					...partial(schema.tables.characters.validator.fields),
					characterId: v.id("characters"),
					aspectSkills: v.optional(
						v.object({
							add: v.optional(v.string()),
							remove: v.optional(v.string()),
						}),
					),
				}),
			),
		),
	},
	handler(ctx, { updates = [], ...args }) {
		return Effect.gen(function* () {
			if (args.characterId) {
				updates.push({ ...args, characterId: args.characterId })
			}
			const results = []
			for (const { characterId, aspectSkills, ...props } of updates) {
				const { character } = yield* queryViewableCharacter(
					ctx.table("characters").get(characterId),
				)

				const newAspectSkills = { ...character.aspectSkills }
				if (aspectSkills?.add) {
					newAspectSkills[aspectSkills.add] = aspectSkills.add
				}
				if (aspectSkills?.remove) {
					delete newAspectSkills[aspectSkills.remove]
				}

				results.push(
					yield* Effect.promise(() =>
						character.patch({ ...props, aspectSkills: newAspectSkills }).get(),
					),
				)
			}
			return results
		}).pipe(Effect.orDie)
	},
})

export const remove = effectMutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	handler(ctx, args) {
		return pipe(
			Effect.forEach(args.characterIds, (id) =>
				pipe(
					queryViewableCharacter(ctx.table("characters").get(id)),
					Effect.flatMap(({ character }) =>
						Effect.promise(() => character.delete()),
					),
				),
			),
			Effect.asVoid,
			Effect.orDie,
		)
	},
})

export const duplicate = effectMutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	handler(ctx, args) {
		return pipe(
			Effect.promise(() =>
				ctx.table("characters").getManyX(args.characterIds).docs(),
			),
			Effect.flatMap(
				Effect.forEach(({ _id, _creationTime, ...props }) =>
					Effect.promise(() => ctx.table("characters").insert(props)),
				),
			),
			Effect.orDie,
		)
	},
})

export function protectCharacterEnt(
	ent: Ent<"characters">,
	userId: Id<"users">,
) {
	return Effect.gen(function* () {
		const room = yield* Effect.promise(() => ent.edge("room"))
		const normalized = normalizeCharacter(ent.doc())
		return protectCharacter(normalized, userId, room)
	})
}

function createCharacter(
	ctx: EntMutationCtx,
	userId: Id<"users">,
	args: Partial<WithoutSystemFields<Doc<"characters">>> & {
		roomId: Id<"rooms">
	},
) {
	return Effect.promise(() =>
		ctx.table("characters").insert({
			name: "New Character",
			...args,
			ownerId: userId,
			updatedAt: Date.now(),
		}),
	)
}

export type NormalizedCharacter = ReturnType<typeof normalizeCharacter>

export function normalizeCharacter(doc: Doc<"characters">) {
	const attributes = normalizeCharacterAttributes(doc.attributes)

	const bonuses = match(doc.race)
		.with("Myrmadon", () => ({ health: 10, resolve: 0 }))
		.with("Sylvanix", () => ({ health: 0, resolve: 5 }))
		.otherwise(() => ({ health: 0, resolve: 0 }))

	const healthMax =
		getAttributeDie(attributes.strength) +
		getAttributeDie(attributes.mobility) +
		bonuses.health

	const resolveMax =
		attributes.sense + attributes.intellect + attributes.wit + bonuses.resolve

	const normalized = {
		...doc,

		type: doc.type ?? "npc",

		race: doc.race,

		attributes,

		movementSpeed: getAttributeDie(attributes.mobility),

		health: doc.health ?? healthMax,
		healthMax,

		resolve: doc.resolve ?? resolveMax,
		resolveMax,

		wealth: doc.wealth ?? DEFAULT_WEALTH_TIER,
	}
	return normalized satisfies Doc<"characters">
}

export type ProtectedCharacter = NonNullable<
	ReturnType<typeof protectCharacter>
>

function queryViewableCharacter<EntType extends Ent<"characters">>(
	query: PromiseLike<EntType | null>,
) {
	return Effect.gen(function* () {
		const ctx = yield* getQueryCtx()
		const userId = yield* getAuthUserId(ctx)

		const character = yield* Effect.filterOrFail(
			Effect.promise(() => query),
			(ent) => ent != null,
			() => new InaccessibleError({ table: "characters" }),
		)

		const room = yield* Effect.promise(() => character.edge("room"))
		const authorized =
			isRoomOwner(room, userId) ||
			character.playerId === userId ||
			character.ownerId === userId

		if (!authorized) {
			return yield* Effect.fail(
				() => new InaccessibleError({ table: "characters" }),
			)
		}

		return { character, room, userId }
	})
}

export function protectCharacter(
	character: NormalizedCharacter,
	userId: Id<"users">,
	room: Doc<"rooms">,
) {
	const isAdmin = isCharacterAdmin(character, room, userId)

	const visible = isAdmin || character.visible

	if (!visible) {
		return null
	}

	return {
		_id: character._id,
		imageId: character.imageId,
		race: character.race,
		isAdmin,
		isPlayer: character.playerId === userId,

		...(isAdmin && {
			full: character,
		}),

		...((character.nameVisible || isAdmin) && {
			identity: {
				name: character.name,
				pronouns: character.pronouns,
			},
		}),

		/** @deprecated Access the public properties directly */
		public: {
			_id: character._id,
			imageId: character.imageId,
			race: character.race,
		},
	}
}

export function isCharacterAdmin(
	character: Doc<"characters">,
	room: Doc<"rooms">,
	userId: Id<"users">,
) {
	return (
		isRoomOwner(room, userId) ||
		character.ownerId === userId ||
		character.playerId === userId
	)
}

export function ensureCharacterEntAdmin(
	ctx: EntQueryCtx,
	character: Ent<"characters">,
) {
	return Effect.gen(function* () {
		const userId = yield* getAuthUserId(ctx)
		const room = yield* queryEnt(character.edge("room"))
		if (isCharacterAdmin(character, room, userId)) {
			return character
		}
		return yield* Effect.fail(
			new InaccessibleError({ id: character._id, table: "characters" }),
		)
	})
}
