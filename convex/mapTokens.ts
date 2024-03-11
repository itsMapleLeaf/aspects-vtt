import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
	args: {
		roomSlug: v.string(),
		name: v.string(),
		x: v.number(),
		y: v.number(),
		imageId: v.optional(v.id("images")),
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

export const update = mutation({
	args: {
		id: v.id("mapTokens"),
		name: v.optional(v.string()),
		x: v.optional(v.number()),
		y: v.optional(v.number()),
		imageId: v.optional(v.id("images")),
	},
	handler: async (ctx, { id, ...data }) => {
		return await ctx.db.patch(id, data)
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
