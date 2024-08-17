import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { omit } from "../common/object.ts"
import type { Id } from "./_generated/dataModel"
import { type LocalQueryCtx, mutation, query } from "./api.ts"
import { UnauthorizedError } from "./auth.ts"
import { partial } from "./helpers/partial.ts"
import { getViewerRoomPlayer } from "./rooms/functions.ts"
import schema from "./schema.ts"
import { getCurrentUserId } from "./users.ts"

export const get = query({
	args: {
		itemId: v.id("items"),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const item = yield* ctx.db.get(args.itemId)
			yield* getViewerRoomPlayer(ctx, item.roomId)
			return item
		}).pipe(
			Effect.catchTags({
				NotLoggedIn: () => Effect.succeed(null),
				DocNotFound: () => Effect.succeed(null),
				UserNotInRoom: () => Effect.succeed(null),
			}),
		)
	},
})

export const list = query({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	handler(ctx, args) {
		return pipe(
			getViewerRoomPlayer(ctx, args.roomId),
			Effect.andThen(() => {
				let query
				query = ctx.db.query("items")
				if (args.search) {
					query = query.withSearchIndex("name", (q) =>
						q.search("name", args.search!).eq("roomId", args.roomId),
					)
				} else {
					query = query.withIndex("roomId", (q) => q.eq("roomId", args.roomId))
				}
				return query.collect()
			}),
			Effect.catchTags({
				NotLoggedIn: () => Effect.succeed([]),
				UserNotInRoom: () => Effect.succeed([]),
			}),
		)
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
		name: v.string(),
		description: v.string(),
		characterId: v.optional(v.id("characters")),
	},
	handler(ctx, { characterId, ...args }) {
		return pipe(
			Effect.gen(function* () {
				yield* getViewerRoomPlayer(ctx, args.roomId)
				if (characterId) {
					yield* ensureViewerCharacterItemsPermission(ctx, characterId)
				}

				const itemId = yield* ctx.db.insert("items", args)

				if (characterId) {
					const existing = yield* queryCharacterItem(
						ctx,
						characterId,
						itemId,
					).uniqueOrNull()

					if (!existing) {
						yield* ctx.db.insert("characterItems", {
							characterId: characterId,
							itemId,
							quantity: 1,
						})
					}
				}

				return itemId
			}),
			Effect.orDie,
		)
	},
})

export const update = mutation({
	args: {
		itemId: v.id("items"),
		...omit(partial(schema.tables.items.validator.fields), ["roomId"]),
	},
	handler(ctx, { itemId, ...args }) {
		return pipe(
			ctx.db.get(itemId),
			Effect.tap((item) => getViewerRoomPlayer(ctx, item.roomId)),
			Effect.flatMap((item) => ctx.db.patch(item._id, args)),
			Effect.orDie,
		)
	},
})

export const remove = mutation({
	args: {
		itemId: v.id("items"),
	},
	handler(ctx, args) {
		return pipe(
			ctx.db.get(args.itemId),
			Effect.tap((item) => getViewerRoomPlayer(ctx, item.roomId)),
			Effect.flatMap((item) => ctx.db.delete(item._id)),
			Effect.orDie,
		)
	},
})

export const listByCharacter = query({
	args: {
		characterId: v.id("characters"),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const character = yield* ctx.db.get(args.characterId)
			const room = yield* ctx.db.get(character.roomId)
			const userId = yield* getCurrentUserId(ctx)
			const hasPermission = room.owner === userId || character.player === userId
			if (!hasPermission) {
				return []
			}

			const characterItems = yield* ctx.db
				.query("characterItems")
				.withIndex("characterId", (q) => q.eq("characterId", args.characterId))
				.collect()

			return yield* Effect.allSuccesses(
				characterItems.map((characterItem) =>
					pipe(
						ctx.db.get(characterItem.itemId),
						Effect.map((item) => ({
							...item,
							quantity: characterItem.quantity,
						})),
					),
				),
			)
		}).pipe(
			Effect.catchTags({
				NotLoggedIn: () => Effect.succeed([]),
				DocNotFound: () => Effect.succeed([]),
			}),
		)
	},
})

export const addToCharacter = mutation({
	args: {
		characterId: v.id("characters"),
		itemId: v.id("items"),
		quantity: v.optional(v.number()),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			yield* ctx.db.get(args.itemId) // ensure item exists
			yield* ensureViewerCharacterItemsPermission(ctx, args.characterId)

			yield* ctx.db.insert("characterItems", {
				characterId: args.characterId,
				itemId: args.itemId,
				quantity: args.quantity ?? 1,
			})
		}).pipe(Effect.orDie)
	},
})

export const removeFromCharacter = mutation({
	args: {
		characterId: v.id("characters"),
		itemId: v.id("items"),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			yield* ctx.db.get(args.itemId) // ensure item exists
			yield* ensureViewerCharacterItemsPermission(ctx, args.characterId)

			const entry = yield* queryCharacterItem(
				ctx,
				args.characterId,
				args.itemId,
			).unique()
			yield* ctx.db.delete(entry._id)
		}).pipe(Effect.orDie)
	},
})

export const updateCharacterItem = mutation({
	args: {
		characterId: v.id("characters"),
		itemId: v.id("items"),
		quantity: v.optional(v.number()),
	},
	handler(ctx, { characterId, itemId, ...args }) {
		return Effect.gen(function* () {
			yield* ctx.db.get(itemId) // ensure item exists
			yield* ensureViewerCharacterItemsPermission(ctx, characterId)

			const entry = yield* queryCharacterItem(ctx, characterId, itemId).unique()

			yield* ctx.db.patch(entry._id, args)
		}).pipe(Effect.orDie)
	},
})

function ensureViewerCharacterItemsPermission(
	ctx: LocalQueryCtx,
	characterId: Id<"characters">,
) {
	return Effect.gen(function* () {
		const character = yield* ctx.db.get(characterId)
		const room = yield* ctx.db.get(character.roomId)
		const userId = yield* getCurrentUserId(ctx)

		const hasPermission = room.owner === userId || character.player === userId
		if (!hasPermission) {
			return yield* new UnauthorizedError(
				"You must be the room owner or character player.",
			)
		}
	})
}

function queryCharacterItem(
	ctx: LocalQueryCtx,
	characterId: Id<"characters">,
	itemId: Id<"items">,
) {
	return ctx.db
		.query("characterItems")
		.withIndex("characterId_itemId", (q) =>
			q.eq("characterId", characterId).eq("itemId", itemId),
		)
}
