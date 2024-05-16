import { v } from "convex/values"
import { mutation, query } from "../helpers/ents.ts"
import { characterAspectSkillProperties } from "./types.ts"

export const get = query({
	args: {
		characterAspectSkillId: v.id("characterAspectSkills"),
	},
	handler: async (ctx, args) => {
		return await ctx.table("characterAspectSkills").get(args.characterAspectSkillId)
	},
})

export const list = query({
	args: {
		characterId: v.id("characters"),
	},
	handler: async (ctx, args) => {
		return await ctx.table("characters").getX(args.characterId).edge("characterAspectSkills").docs()
	},
})

export const create = mutation({
	args: {
		...characterAspectSkillProperties,
		characterAspectSkillId: v.id("characterAspectSkills"),
	},
	handler: async (ctx, args) => {
		return await ctx.table("characterAspectSkills").insert(args)
	},
})

export const remove = mutation({
	args: {
		characterAspectSkillId: v.id("characterAspectSkills"),
	},
	handler: async (ctx, args) => {
		return await ctx.table("characterAspectSkills").getX(args.characterAspectSkillId).delete()
	},
})
