import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
	args: {
		storageId: v.id("_storage"),
		mimeType: v.string(),
	},
	handler: async (ctx, data) => {
		return await ctx.db.insert("images", data)
	},
})

export const get = query({
	args: {
		id: v.id("images"),
	},
	handler: async (ctx, { id }) => {
		return await ctx.db.get(id)
	},
})

export const update = mutation({
	args: {
		id: v.id("images"),
		storageId: v.id("_storage"),
		mimeType: v.string(),
	},
	handler: async (ctx, { id, ...data }) => {
		const existing = await ctx.db.get(id)
		if (existing) {
			await ctx.storage.delete(existing.storageId)
		}
		await ctx.db.patch(id, data)
	},
})

export const remove = mutation({
	args: {
		id: v.id("images"),
	},
	handler: async (ctx, { id }) => {
		return await ctx.db.delete(id)
	},
})
