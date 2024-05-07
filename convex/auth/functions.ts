import { v } from "convex/values"
import { type QueryCtx, mutation, query } from "../_generated/server.js"
import type { Branded } from "../helpers/convex.js"
import { getUserFromIdentity } from "./helpers.ts"
import { getIdentity } from "./helpers.ts"

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
