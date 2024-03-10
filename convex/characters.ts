import { type Infer, v } from "convex/values"
import { raise } from "~/common/errors.js"
import { expect } from "~/common/expect.js"
import { mutation, query } from "./_generated/server.js"
import { characterNames } from "./characterNames.js"

export const characterCreatePayload = {
	player: v.optional(v.string()),
	roomSlug: v.string(),
}

const characterValueValidator = v.union(v.string(), v.number(), v.boolean())
export type CharacterValue = Infer<typeof characterValueValidator>

export const characterValueObjectValidator = v.object({
	key: v.string(),
	value: characterValueValidator,
})
export type CharacterImage = Infer<typeof characterImageValidator>

export const characterImageValidator = v.object({
	name: v.string(),
	mimeType: v.string(),
	storageId: v.id("_storage"),
})

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
		image: v.optional(v.union(v.null(), characterImageValidator)),
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
