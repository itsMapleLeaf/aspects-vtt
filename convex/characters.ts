import { v } from "convex/values"
import { expect } from "~/common/expect.js"
import { mutation, query } from "./_generated/server.js"
import { characterNames } from "./characterNames.js"

export const characterCreatePayload = {
	player: v.optional(v.string()),
	roomSlug: v.string(),
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
		return await ctx.db.insert("characters", {
			...args,
			name: expect(
				characterNames[Math.floor(Math.random() * characterNames.length)],
				"Character names is empty",
			),
		})
	},
})

export const update = mutation({
	args: {
		id: v.id("characters"),
		name: v.optional(v.string()),
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
