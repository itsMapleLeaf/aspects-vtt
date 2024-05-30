import { Effect, pipe } from "effect"
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
		return pipe(
			getIdentityEffect(),
			Effect.flatMap((identity) => {
				const data = {
					name: identity.nickname || identity.name || "anonymous",
					avatarUrl: identity.pictureUrl,
				}
				return pipe(
					getUserFromClerkId(identity.subject),
					Effect.flatMap((user) =>
						withMutationCtx((ctx) => ctx.table("users").getX(user._id).patch(data).get().doc()),
					),
					Effect.catchTag("UserNotFoundError", () =>
						withMutationCtx((ctx) =>
							ctx
								.table("users")
								.insert({ ...data, clerkId: identity.subject })
								.get()
								.doc(),
						),
					),
				)
			}),
		)
	},
})
