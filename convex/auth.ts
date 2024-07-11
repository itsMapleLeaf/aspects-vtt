import Discord from "@auth/core/providers/discord"
import { Password } from "@convex-dev/auth/providers/Password"
import { convexAuth } from "@convex-dev/auth/server"
import { ConvexError } from "convex/values"
import { Effect } from "effect"
import { query } from "./_generated/server"
import { Errors } from "./errors.ts"

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [
		Discord,
		Password({
			profile(params) {
				return {
					name: params.name as string,
					email: params.email as string,
				}
			},
		}),
	],
})

export const me = query({
	handler: (ctx) => {
		return Effect.gen(function* () {
			const userId = yield* Effect.promise(() => auth.getUserId(ctx)).pipe(
				Effect.filterOrFail(
					(userId) => userId !== null,
					() => new ConvexError(Errors.NOT_SIGNED_IN),
				),
			)
			const user = yield* Effect.promise(() => ctx.db.get(userId)).pipe(
				Effect.filterOrDie(
					(user) => user !== null,
					() => new ConvexError(Errors.USER_NOT_FOUND),
				),
			)
			return user
		}).pipe(
			Effect.orElseSucceed(() => null),
			Effect.runPromise,
		)
	},
})
