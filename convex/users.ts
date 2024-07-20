import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { MutationCtx, query } from "./_generated/server"
import { mutation } from "./_generated/server.js"
import { getAuthUser } from "./lib/auth.ts"
import { endpoint, FunctionContextService } from "./lib/effect.ts"

export const me = endpoint(query, {
	handler: pipe(
		getAuthUser(),
		Effect.orElseSucceed(() => null),
	),
})

export const update = endpoint(mutation, {
	args: {
		handle: v.optional(v.string()),
		name: v.optional(v.string()),
	},
	handler: (args) =>
		pipe(
			Effect.all({
				user: getAuthUser(),
				ctx: FunctionContextService<MutationCtx>(),
			}),
			Effect.flatMap(({ user, ctx }) =>
				Effect.promise(() => ctx.db.patch(user._id, args)),
			),
			Effect.orDie,
		),
})
