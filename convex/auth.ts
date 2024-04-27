import type { UserIdentity } from "convex/server"
import { v } from "convex/values"
import { Result } from "#app/common/Result.js"
import { type QueryCtx, mutation, query } from "./_generated/server.js"
import type { Branded } from "./helpers.js"
import { getUserFromIdentity } from "./users.js"

export const user = query({
	handler: async (ctx: QueryCtx) => {
		return await getUserFromIdentity(ctx).resolveJson()
	},
})

export const setup = mutation({
	args: {
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	},
	async handler(ctx, args) {
		const user = await getUserFromIdentity(ctx).getValueOrNull()
		const identity = await getIdentity(ctx).getValueOrThrow()
		if (user) {
			await ctx.db.patch(user._id, args)
		} else {
			await ctx.db.insert("users", { ...args, clerkId: identity.subject as Branded<"clerkId"> })
		}
	},
})

export function getIdentity(ctx: QueryCtx) {
	return Result.fn(async () => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new Error("Not logged in")
		}
		return identity as UserIdentity & { subject: Branded<"clerkId"> }
	})
}
