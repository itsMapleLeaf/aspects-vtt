import { v } from "convex/values"
import { getAuthUser } from "../lib/auth.ts"
import { EntMutationCtx, EntQueryCtx, mutation, query } from "../lib/ents.ts"

export const me = query({
	handler: async (ctx: EntQueryCtx) => {
		try {
			return await getAuthUser(ctx)
		} catch {
			return null
		}
	},
})

export const update = mutation({
	args: {
		handle: v.optional(v.string()),
		name: v.optional(v.string()),
	},
	handler: async (ctx: EntMutationCtx, { handle, ...args }) => {
		const user = await getAuthUser(ctx)

		if (handle !== undefined && handle !== user.handle) {
			const existing = await ctx
				.table("users", "handle", (q) => q.eq("handle", handle))
				.first()

			if (existing != null) {
				throw new Error(`Sorry, the handle "${handle}" is already taken.`)
			}
		}

		await ctx
			.table("users")
			.getX(user._id)
			.patch({ ...args, handle })
	},
})
