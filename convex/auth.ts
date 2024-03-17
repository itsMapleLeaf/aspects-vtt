import { ConvexError, v } from "convex/values"
import { type QueryCtx, mutation, query } from "./_generated/server.js"

export const user = query({
	async handler(ctx) {
		return await getIdentityUser(ctx)
	},
})

export const setup = mutation({
	args: {
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	},
	async handler(ctx, args) {
		const identity = await requireIdentity(ctx)
		const user = await getIdentityUser(ctx)
		if (user) {
			await ctx.db.patch(user._id, {
				name: args.name,
				avatarUrl: args.avatarUrl,
			})
		} else {
			await ctx.db.insert("users", {
				clerkId: identity.subject,
				name: args.name,
				avatarUrl: args.avatarUrl,
			})
		}
	},
})

async function requireIdentity(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity()
	if (!identity) throw new ConvexError("Not logged in")
	return identity
}

export async function getIdentityUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity()
	return (
		identity &&
		(await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique())
	)
}

export async function requireIdentityUser(ctx: QueryCtx) {
	const user = await getIdentityUser(ctx)
	if (!user) throw new ConvexError("User not found")
	return user
}
