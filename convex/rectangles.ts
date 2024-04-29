import { getManyFrom } from "convex-helpers/server/relationships"
import { partial } from "convex-helpers/validators"
import { ConvexError, v } from "convex/values"
import { Result } from "../app/common/Result.ts"
import { RoomModel } from "./RoomModel.ts"
import type { Id } from "./_generated/dataModel"
import { type QueryCtx, mutation, query } from "./_generated/server"
import { tokenValidator } from "./token.ts"

export const rectangleProperties = {
	size: v.object({ width: v.number(), height: v.number() }),
	token: tokenValidator,
}

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, args) {
		return await getManyFrom(ctx.db, "rectangles", "by_roomId", args.roomId)
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
		...rectangleProperties,
	},
	async handler(ctx, args) {
		await assertRectanglePermissions(ctx, args)
		return await ctx.db.insert("rectangles", args)
	},
})

export const update = mutation({
	args: {
		id: v.id("rectangles"),
		...partial(rectangleProperties),
	},
	async handler(ctx, { id, ...args }) {
		await assertRectanglePermissions(ctx, { id })
		return await ctx.db.patch(id, args)
	},
})

export const remove = mutation({
	args: {
		id: v.id("rectangles"),
	},
	async handler(ctx, args) {
		await assertRectanglePermissions(ctx, args)
		return await ctx.db.delete(args.id)
	},
})

function getRectangleById(ctx: QueryCtx, id: Id<"rectangles">) {
	return Result.fn(async () => {
		const rectangle = await ctx.db.get(id)
		if (!rectangle) {
			throw new ConvexError(`Couldn't find rectangle with id ${id}`)
		}
		return rectangle
	})
}

async function assertRectanglePermissions(
	ctx: QueryCtx,
	args: { id: Id<"rectangles"> } | { roomId: Id<"rooms"> },
) {
	let roomId
	if ("roomId" in args) {
		roomId = args.roomId
	} else {
		const rectangle = await getRectangleById(ctx, args.id).getValueOrThrow()
		roomId = rectangle.roomId
	}
	const room = await RoomModel.fromId(ctx, roomId).getValueOrThrow()
	await room.getIdentityPlayer().getValueOrThrow()
}
