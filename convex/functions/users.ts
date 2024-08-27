import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { mutation, query } from "../lib/api.ts"
import { getAuthUser } from "../lib/auth.ts"
import { ConvexEffectError } from "@maple/convex-effect"

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
	handler: (ctx, { handle, ...args }) =>
		Effect.gen(function* () {
			const user = yield* getAuthUser(ctx)

			if (handle !== undefined && handle !== user.handle) {
				const existing = yield* ctx.db
					.query("users")
					.withIndex("handle", (q) => q.eq("handle", handle))
					.firstOrNull()

				if (existing != null) {
					return yield* new ConvexEffectError(
						`Sorry, the handle "${handle}" is already taken.`,
					)
				}
			}

			yield* ctx.db.patch(user._id, { ...args, handle })
		}).pipe(Effect.orDie),
})
