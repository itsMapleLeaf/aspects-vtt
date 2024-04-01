import { ConvexError, v } from "convex/values"
import { generateSlug } from "random-word-slugs"
import { Result } from "#app/common/Result.js"
import { range } from "#app/common/range.js"
import { RoomModel } from "./RoomModel.js"
import { UserModel } from "./UserModel.js"
import { type QueryCtx, mutation, query } from "./_generated/server.js"
import { withResultResponse } from "./resultResponse.js"

export const get = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		return await Result.fn(async () => {
			const room = await RoomModel.fromSlug(ctx, args.slug).unwrap()
			return {
				...room.data,
				isOwner: await room.isOwner(),
				players: await room.getClientPlayers(),
			}
		}).json()
	},
})

export const list = query({
	handler: withResultResponse(async (ctx: QueryCtx) => {
		const user = await UserModel.fromIdentity(ctx)
		return await ctx.db
			.query("rooms")
			.withIndex("by_owner", (q) => q.eq("ownerId", user.data.clerkId))
			.collect()
	}),
})

export const create = mutation({
	handler: async (ctx) => {
		const user = await UserModel.fromIdentity(ctx)
		const slug = await generateUniqueSlug(ctx)

		await ctx.db.insert("rooms", {
			name: slug,
			slug,
			ownerId: user.data.clerkId,
			players: [],
		})

		return { slug }

		async function generateUniqueSlug(ctx: QueryCtx): Promise<string> {
			for (const _attempt of range(10)) {
				const slug = generateSlug()
				const existing = await RoomModel.fromSlug(ctx, slug)
				if (!existing.value) return slug
			}
			throw new ConvexError("Failed to generate a unique slug")
		}
	},
})

export const update = mutation({
	args: {
		id: v.id("rooms"),
		name: v.optional(v.string()),
		mapImageId: v.optional(v.id("_storage")),
		mapDimensions: v.optional(v.object({ width: v.number(), height: v.number() })),
		mapCellSize: v.optional(v.number()),
	},
	handler: async (ctx, { id, ...args }) => {
		const room = await RoomModel.fromId(ctx, id).unwrap()
		await room.update(ctx, args)
	},
})

export const remove = mutation({
	args: { id: v.id("rooms") },
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).unwrap()
		await room.delete(ctx)
	},
})

export const join = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).unwrap()
		await room.join(ctx)
	},
})
