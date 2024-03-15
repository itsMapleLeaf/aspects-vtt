import { type Infer, v } from "convex/values"
import { raise } from "#app/common/errors.js"
import { mutation, query } from "./_generated/server.js"

const characterFieldValueValidator = v.union(v.string(), v.number(), v.boolean())
export type CharacterFieldValue = Infer<typeof characterFieldValueValidator>

export const characterFieldValidator = v.object({
	key: v.string(),
	value: characterFieldValueValidator,
})
export type CharacterField = Infer<typeof characterFieldValidator>

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
		id: v.string(),
	},
	handler: async (ctx, args) => {
		const id = ctx.db.normalizeId("characters", args.id)
		return await ctx.db.get(id ?? raise(`Invalid character ID: ${args.id}`))
	},
})

export const create = mutation({
	args: {
		player: v.string(),
		fields: v.array(characterFieldValidator),
		roomSlug: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("characters", args)
	},
})

export const update = mutation({
	args: {
		id: v.id("characters"),
		player: v.optional(v.string()),
		imageId: v.optional(v.id("images")),
		fields: v.optional(
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
