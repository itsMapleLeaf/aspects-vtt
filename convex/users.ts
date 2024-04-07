import { ConvexError } from "convex/values"
import { Result } from "#app/common/Result.js"
import type { QueryCtx } from "./_generated/server"
import type { Branded } from "./helpers.ts"

export function getUserFromClerkId(ctx: QueryCtx, clerkId: Branded<"clerkId">) {
	return Result.fn(async () => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
			.unique()
		if (!user) {
			throw new ConvexError(`Couldn't find user with clerkId "${clerkId}"`)
		}
		return user
	})
}

export function getUserFromIdentity(ctx: QueryCtx) {
	return Result.fn(async () => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new ConvexError("Not logged in")
		}
		return getUserFromClerkId(ctx, identity.subject as Branded<"clerkId">).getValueOrThrow()
	})
}
