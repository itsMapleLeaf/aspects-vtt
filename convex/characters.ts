import { v } from "convex/values"
import { mutation, query } from "./_generated/server.js"

export const characterCreatePayload = {
	roomSlug: v.string(),
	player: v.optional(v.string()),
}

export const list = query({
	args: {
		roomSlug: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("characters")
			.withIndex("by_room", (q) => q.eq("roomSlug", args.roomSlug))
			.collect()
	},
})

export const get = query({
	args: {
		id: v.id("characters"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id)
	},
})

export const create = mutation({
	args: characterCreatePayload,
	handler: async (ctx, args) => {
		return await ctx.db.insert("characters", args)
	},
})

export const update = mutation({
	args: {
		id: v.id("characters"),
		player: v.optional(v.string()),
		values: v.optional(
			v.array(
				v.object({
					key: v.string(),
					value: v.union(v.string(), v.number(), v.boolean()),
				}),
			),
		),
	},
	handler: async (ctx, { id, ...data }) => {
		await ctx.db.patch(id, data)
	},
})

export const remove = mutation({
	args: {
		id: v.id("characters"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id)
	},
})
