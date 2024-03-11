import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
	args: {
		roomSlug: v.string(),
		name: v.string(),
		image: v.id("_storage"),
		x: v.number(),
		y: v.number(),
	},
	handler: async (ctx, data) => {
		return await ctx.db.insert("mapTokens", data)
	},
})

export const list = query({
	args: {
		roomSlug: v.string(),
	},
	handler: async (ctx, { roomSlug }) => {
		return await ctx.db
			.query("mapTokens")
			.withIndex("by_room", (q) => q.eq("roomSlug", roomSlug))
			.collect()
	},
})

export const remove = mutation({
	args: {
		id: v.id("mapTokens"),
	},
	handler: async (ctx, { id }) => {
		return await ctx.db.delete(id)
	},
})
