import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { getAuthUser } from "./lib/auth.ts"
import { MutationContextService } from "./lib/context.ts"
import { effectMutation, effectQuery } from "./lib/functions.ts"

export const me = effectQuery({
	handler: () =>
		pipe(
			getAuthUser(),
			Effect.orElseSucceed(() => null),
		),
})

export const update = effectMutation({
	args: {
		handle: v.optional(v.string()),
		name: v.optional(v.string()),
	},
	handler: (args) =>
		pipe(
			getAuthUser(),
			Effect.flatMap((user) =>
				Effect.flatMap(MutationContextService, (ctx) =>
					Effect.promise(() => ctx.db.patch(user._id, args)),
				),
			),
			Effect.orDie,
		),
})
