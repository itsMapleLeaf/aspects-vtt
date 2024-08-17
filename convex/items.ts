import { v } from "convex/values"
import { Effect } from "effect"
import { mutation, query } from "./api.ts"
import { getViewerRoomPlayer } from "./rooms/functions.ts"

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
				NotLoggedInError: () => Effect.succeed(null),
				DocNotFound: () => Effect.succeed(null),
			}),
		)
	},
})

export const list = query({
	args: {},
	handler(ctx, args) {
		return Effect.void
	},
})

export const create = mutation({
	args: {},
	handler(ctx, args) {
		return Effect.void
	},
})

export const update = mutation({
	args: {
		itemId: v.id("items"),
	},
	handler(ctx, args) {
		return Effect.void
	},
})

export const remove = mutation({
	args: {
		itemId: v.id("items"),
	},
	handler(ctx, args) {
		return Effect.void
	},
})
