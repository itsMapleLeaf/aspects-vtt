import type { WithoutSystemFields } from "convex/server"
import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { clamp, compact } from "lodash-es"
import { DEFAULT_WEALTH_TIER } from "~/features/characters/constants.ts"
import { Doc, type Id } from "./_generated/dataModel"
import { InaccessibleError, getAuthUserId } from "./auth.ts"
import {
	effectMutation,
	effectQuery,
	getQueryCtx,
	queryEnt,
} from "./lib/effects.ts"
import { type Ent, type EntMutationCtx } from "./lib/ents.ts"
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
				return yield* protectEnt(ent, userId)
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
				Effect.flatMap(Effect.forEach((ent) => protectEnt(ent, userId))),
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

export const update = effectMutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		characterId: v.id("characters"),
	},
	handler(ctx, { characterId, ...args }) {
		return pipe(
			queryViewableCharacter(ctx.table("characters").get(characterId)),
			Effect.flatMap(({ character }) =>
				Effect.promise(() => character.patch(args)),
			),
			Effect.orDie,
		)
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

function protectEnt(ent: Ent<"characters">, userId: Id<"users">) {
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

	const healthMax =
		getAttributeDie(attributes.strength) + getAttributeDie(attributes.mobility)
	const resolveMax = attributes.sense + attributes.intellect + attributes.wit

	const normalized = {
		...doc,

		attributes,

		health: doc.health ?? healthMax,
		healthMax,

		resolve: doc.resolve ?? resolveMax,
		resolveMax,

		wealth: doc.wealth ?? DEFAULT_WEALTH_TIER,

		battlemapPosition: doc.battlemapPosition ?? { x: 0, y: 0 },

		protected: false as const,
	}
	return normalized satisfies Doc<"characters">
}

export function normalizeCharacterAttributes(
	attributes: Doc<"characters">["attributes"],
) {
	return {
		strength: normalizeAttribute(attributes?.strength),
		sense: normalizeAttribute(attributes?.sense),
		mobility: normalizeAttribute(attributes?.mobility),
		intellect: normalizeAttribute(attributes?.intellect),
		wit: normalizeAttribute(attributes?.wit),
	}
}

function normalizeAttribute(attribute: number | undefined): number {
	return clamp(attribute ?? 1, 1, 5)
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
		const authorized = isRoomOwner(room, userId) || character.ownerId === userId

		if (!authorized) {
			return yield* Effect.fail(
				() => new InaccessibleError({ table: "characters" }),
			)
		}

		return { character, room, userId }
	})
}

function protectCharacter(
	character: NormalizedCharacter,
	userId: Id<"users">,
	room: Doc<"rooms">,
) {
	const isCharacterAdmin =
		isRoomOwner(room, userId) || character.playerId === userId

	const visible =
		isCharacterAdmin || character.visible || character.tokenVisible

	if (!visible) {
		return null
	}

	return {
		...(isCharacterAdmin && {
			full: character,
		}),

		public: {
			_id: character._id,
			imageId: character.imageId,
			race: character.race,
		},

		...(character.nameVisible && {
			identity: {
				name: character.name,
				pronouns: character.pronouns,
			},
		}),

		...(character.tokenVisible && {
			token: {
				battlemapPosition: character.battlemapPosition,
				updatedAt: character.updatedAt,
			},
		}),
	}
}

export function getAttributeDie(attribute: number) {
	return [4, 6, 8, 10, 12][normalizeAttribute(attribute) - 1] as number
}
