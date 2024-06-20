import { getOneFrom } from "convex-helpers/server/relationships"
import { brandedString } from "convex-helpers/validators"
import { v } from "convex/values"
import { Effect } from "effect"
import { internalEffectMutation, withMutationCtx, withQueryCtx } from "./helpers/effect.ts"

export const upsert = internalEffectMutation({
	args: {
		name: v.string(),
		avatarUrl: v.optional(v.string()),
		clerkId: brandedString("clerkId"),
	},
	handler(args) {
		return Effect.gen(function* () {
			const existing = yield* withQueryCtx((ctx) =>
				getOneFrom(ctx.db, "users", "clerkId", args.clerkId),
			)

			return yield* withMutationCtx(async (ctx) => {
				if (existing) {
					await ctx.db.patch(existing._id, {
						name: args.name,
						avatarUrl: args.avatarUrl,
					})
				} else {
					await ctx.db.insert("users", {
						name: args.name,
						avatarUrl: args.avatarUrl,
						clerkId: args.clerkId,
					})
				}
			})
		})
	},
})

export const remove = internalEffectMutation({
	args: {
		clerkId: brandedString("clerkId"),
	},
	handler(args) {
		return Effect.gen(function* () {
			const existing = yield* withQueryCtx((ctx) =>
				getOneFrom(ctx.db, "users", "clerkId", args.clerkId),
			)

			if (!existing) {
				return null
			}

			return yield* withMutationCtx(async (ctx) => {
				await ctx.db.delete(existing._id)
			})
		})
	},
})
