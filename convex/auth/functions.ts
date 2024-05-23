import { Effect } from "effect"
import { effectMutation, withMutationCtx } from "../helpers/effect.ts"
import { type QueryCtx, query } from "../helpers/ents.ts"
import { getIdentityEffect, getUserFromClerkId, getUserFromIdentity } from "./helpers.ts"

export const user = query({
	handler: async (ctx: QueryCtx) => {
		return await getUserFromIdentity(ctx).resolveJson()
	},
})

export const setup = effectMutation({
	args: {},
	handler() {
		return Effect.gen(function* () {
			const identity = yield* getIdentityEffect()
			const data = {
				name: identity.nickname || identity.name || "anonymous",
				avatarUrl: identity.pictureUrl,
			}

			return yield* getUserFromClerkId(identity.subject).pipe(
				Effect.flatMap((user) => {
					return withMutationCtx(async (ctx) => {
						return await ctx.table("users").getX(user._id).patch(data).get().doc()
					})
				}),
				Effect.catchTag("UserNotFoundError", () => {
					return withMutationCtx(async (ctx) => {
						return await ctx
							.table("users")
							.insert({ ...data, clerkId: identity.subject })
							.get()
							.doc()
					})
				}),
			)
		})
	},
})
