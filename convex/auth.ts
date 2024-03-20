import { ConvexError, v } from "convex/values"
import { safeCall } from "#app/common/attempt.js"
import { raise } from "#app/common/errors.js"
import { type QueryCtx, mutation, query } from "./_generated/server.js"
import { withResultResponse } from "./resultResponse.js"

export const user = query({
	handler: withResultResponse(async (ctx: QueryCtx) => {
		return await getIdentityUser(ctx)
	}),
})

export const setup = mutation({
	args: {
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	},
	async handler(ctx, args) {
		const identity = await getIdentity(ctx)
		const [user] = await safeCall(getUserByClerkId, ctx, identity.subject)
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

async function getUserByClerkId(ctx: QueryCtx, clerkId: string) {
	const user = await ctx.db
		.query("users")
		.withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
		.unique()
	return user ?? raise(new ConvexError("User not set up"))
}

async function getIdentity(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity()
	return identity ?? raise(new ConvexError("Not logged in"))
}

export async function getIdentityUser(ctx: QueryCtx) {
	const identity = await getIdentity(ctx)
	return await getUserByClerkId(ctx, identity.subject)
}
