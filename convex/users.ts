import { v } from "convex/values"
import { type QueryCtx, internalMutation, internalQuery } from "./_generated/server"

export const get = internalQuery({
	args: {
		id: v.id("users"),
	},
	async handler(ctx, args) {
		return await ctx.db.get(args.id)
	},
})

export const getByUsername = internalQuery({
	args: {
		username: v.string(),
	},
	async handler(ctx, args) {
		return await getUserByUsername(ctx, args)
	},
})

export const create = internalMutation({
	args: {
		username: v.string(),
		passwordHash: v.string(),
	},
	async handler(ctx, args) {
		const existingUser = await getUserByUsername(ctx, { username: args.username })
		if (existingUser) {
			throw new Error(`User with username "${args.username}" already exists`)
		}
		return await ctx.db.insert("users", args)
	},
})

export const remove = internalMutation({
	args: {
		id: v.id("users"),
	},
	async handler(ctx, args) {
		await ctx.db.delete(args.id)
	},
})

async function getUserByUsername(ctx: QueryCtx, args: { username: string }) {
	return await ctx.db
		.query("users")
		.withIndex("by_username", (q) => q.eq("username", args.username))
		.unique()
}
