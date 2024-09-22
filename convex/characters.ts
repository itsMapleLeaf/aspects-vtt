import { partial } from "convex-helpers/validators"
import type { WithoutSystemFields } from "convex/server"
import { v } from "convex/values"
import { Effect } from "effect"
import { clamp } from "lodash-es"
import { DEFAULT_WEALTH_TIER } from "~/features/characters/constants.ts"
import { Doc, type Id } from "./_generated/dataModel"
import { InaccessibleError, getAuthUserId } from "./lib/auth.ts"
import { queryEntOrFail, runConvexEffect } from "./lib/effects.ts"
import {
	mutation,
	query,
	type EntMutationCtx,
	type EntQueryCtx,
} from "./lib/ents.ts"
import { isRoomOwner } from "./rooms.ts"
import schema from "./schema.ts"

export const get = query({
	args: {
		characterId: v.id("characters"),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				const character = yield* queryEntOrFail(() =>
					ctx.table("characters").get(args.characterId),
				)
				const room = yield* queryEntOrFail(() => character.edge("room"))
				return protectCharacter(normalizeCharacter(character), userId, room)
			}).pipe(Effect.orElseSucceed(() => null)),
		)
	},
})

export const list = query({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			listProtectedCharacters(ctx, args).pipe(Effect.orElseSucceed(() => [])),
		)
	},
})

export const listUnprotected = query({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			listProtectedCharacters(ctx, args).pipe(
				Effect.map((characters) => characters.filter((it) => !it.protected)),
				Effect.orElseSucceed(() => []),
			),
		)
	},
})

export const create = mutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		roomId: v.id("rooms"),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				return yield* createCharacter(ctx, userId, args)
			}),
		)
	},
})

export const update = mutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		characterId: v.id("characters"),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				const character = yield* queryEntOrFail(() =>
					ctx.table("characters").get(args.characterId),
				)
				const room = yield* queryEntOrFail(() => character.edge("room"))

				const authorized =
					isRoomOwner(room, userId) || character.ownerId === userId

				if (!authorized) {
					yield* Effect.fail(
						() =>
							new InaccessibleError({
								id: args.characterId,
								collection: "characters",
							}),
					)
				}

				const { characterId, ...updateArgs } = args
				yield* Effect.promise(() => character.patch(updateArgs))
			}),
		)
	},
})

export const remove = mutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				for (const characterId of args.characterIds) {
					const character = yield* queryEntOrFail(() =>
						ctx.table("characters").get(characterId),
					)
					const room = yield* queryEntOrFail(() => character.edge("room"))

					const authorized =
						isRoomOwner(room, userId) || character.ownerId === userId

					if (!authorized) {
						yield* Effect.fail(
							() =>
								new InaccessibleError({
									id: characterId,
									collection: "characters",
								}),
						)
					}

					yield* Effect.promise(() => character.delete())
				}
			}),
		)
	},
})

export const duplicate = mutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				for (const characterId of args.characterIds) {
					const character = yield* queryEntOrFail(() =>
						ctx.table("characters").get(characterId),
					)
					const { _id, _creationTime, ...characterData } = character
					yield* createCharacter(ctx, userId, characterData)
				}
			}),
		)
	},
})

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

export type ProtectedCharacter = ReturnType<typeof protectCharacter>

function protectCharacter(
	character: NormalizedCharacter,
	userId: Id<"users">,
	room: Doc<"rooms">,
) {
	if (isRoomOwner(room, userId) || character.playerId === userId) {
		return character
	}

	if (!character.visible && !character.tokenVisible) {
		return null
	}

	if (character.tokenVisible && character.nameVisible) {
		return {
			protected: true as const,
			visible: false as const,
			nameVisible: true as const,
			tokenVisible: true as const,

			_id: character._id,
			imageId: character.imageId,
			race: character.race,

			name: character.name,
			pronouns: character.pronouns,

			battlemapPosition: character.battlemapPosition,
			updatedAt: character.updatedAt,
		}
	}

	if (character.tokenVisible) {
		return {
			protected: true as const,
			visible: false as const,
			nameVisible: false as const,
			tokenVisible: true as const,

			_id: character._id,
			imageId: character.imageId,
			race: character.race,

			battlemapPosition: character.battlemapPosition,
			updatedAt: character.updatedAt,
		}
	}

	if (character.visible && character.nameVisible) {
		return {
			protected: true as const,
			visible: true as const,
			nameVisible: true as const,
			tokenVisible: false as const,

			_id: character._id,
			imageId: character.imageId,
			race: character.race,

			name: character.name,
			pronouns: character.pronouns,
		}
	}

	if (character.visible) {
		return {
			protected: true as const,
			visible: true as const,
			nameVisible: false as const,
			tokenVisible: false as const,

			_id: character._id,
			imageId: character.imageId,
			race: character.race,
		}
	}
}

export function getAttributeDie(attribute: number) {
	return [4, 6, 8, 10, 12][normalizeAttribute(attribute) - 1] as number
}

function listProtectedCharacters(
	ctx: EntQueryCtx,
	args: { roomId: Id<"rooms">; search?: string },
) {
	return Effect.gen(function* () {
		const userId = yield* getAuthUserId(ctx)
		let charactersQuery
		if (args.search) {
			charactersQuery = ctx
				.table("characters")
				.search("name", (q) =>
					q.search("name", args.search!).eq("roomId", args.roomId),
				)
		} else {
			charactersQuery = ctx.table("characters", "roomId", (q) =>
				q.eq("roomId", args.roomId),
			)
		}
		const characters = yield* Effect.promise(() => charactersQuery)
		const protectedCharacters = yield* Effect.forEach(characters, (character) =>
			Effect.gen(function* () {
				const room = yield* queryEntOrFail(() => character.edge("room"))
				return protectCharacter(normalizeCharacter(character), userId, room)
			}),
		)
		return protectedCharacters.filter(
			(it): it is NonNullable<typeof it> => it != null,
		)
	})
}
