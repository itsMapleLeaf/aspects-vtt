import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { characterFieldValidator } from "./characters.ts"

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
		x: v.optional(v.number()),
		y: v.optional(v.number()),
		characterId: v.id("characters"),
		overrides: v.optional(v.array(characterFieldValidator)),
	},
	handler: async (ctx, data) => {
		return await ctx.db.insert("mapTokens", data)
	},
})

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, { roomId }) {
		const tokens = await ctx.db
			.query("mapTokens")
			.withIndex("by_room", (q) => q.eq("roomId", roomId))
			.collect()

		const tokensWithCharacters = await Promise.all(
			tokens.map(async (token) => {
				const character = await ctx.db.get(token.characterId)
				return character && { ...token, character }
			}),
		)

		return tokensWithCharacters.filter(Boolean)
	},
})

export const update = mutation({
	args: {
		id: v.id("mapTokens"),
		x: v.optional(v.number()),
		y: v.optional(v.number()),
		characterId: v.optional(v.id("characters")),
		overrides: v.optional(v.array(characterFieldValidator)),
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
