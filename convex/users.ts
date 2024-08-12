import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { mutation, query } from "./lib/api.ts"
import { getAuthUser } from "./lib/auth.ts"

export const me = query({
	handler: (ctx) =>
		pipe(
			getAuthUser(ctx),
			Effect.orElseSucceed(() => null),
		),
})

export const update = mutation({
	args: {
		handle: v.optional(v.string()),
		name: v.optional(v.string()),
	},
	handler: (ctx, args) =>
		pipe(
			getAuthUser(ctx),
			Effect.flatMap((user) => ctx.db.patch(user._id, args)),
			Effect.orDie,
		),
})
