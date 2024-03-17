import { v } from "convex/values"
import { internalMutation, internalQuery } from "./_generated/server"

export const get = internalQuery({
	args: {
		id: v.id("sessions"),
	},
	async handler(ctx, args) {
		return await ctx.db.get(args.id)
	},
})

export const create = internalMutation({
	args: {
		userId: v.id("users"),
	},
	async handler(ctx, args) {
		return await ctx.db.insert("sessions", args)
	},
})

export const remove = internalMutation({
	args: {
		id: v.id("sessions"),
	},
	async handler(ctx, args) {
		await ctx.db.delete(args.id)
	},
})
