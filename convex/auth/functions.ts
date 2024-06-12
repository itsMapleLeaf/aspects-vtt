import { Effect, pipe } from "effect"
import { expect } from "../../app/common/expect.ts"
import { type QueryCtx, query } from "../_generated/server.js"
import { effectMutation, withMutationCtx } from "../helpers/effect.ts"
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
						withMutationCtx(async (ctx) => {
							await ctx.db.patch(user._id, data)
							return { ...user, ...data }
						}),
					),
					Effect.catchTag("UserNotFoundError", () =>
						withMutationCtx(async (ctx) => {
							const id = await ctx.db.insert("users", { ...data, clerkId: identity.subject })
							return expect(await ctx.db.get(id), "user doc was not inserted")
						}),
					),
				)
			}),
		)
	},
})
