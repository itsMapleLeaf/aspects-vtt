import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { omit } from "../common/object.ts"
import { mutation, query } from "./api.ts"
import { partial } from "./helpers/partial.ts"
import { getViewerRoomPlayer } from "./rooms/functions.ts"
import schema from "./schema.ts"

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
	},
	handler(ctx, args) {
		return pipe(
			getViewerRoomPlayer(ctx, args.roomId),
			Effect.andThen(() =>
				ctx.db
					.query("items")
					.withIndex("roomId", (q) => q.eq("roomId", args.roomId))
					.collect(),
			),
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
	},
	handler(ctx, args) {
		return pipe(
			getViewerRoomPlayer(ctx, args.roomId),
			Effect.andThen(() => ctx.db.insert("items", args)),
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
