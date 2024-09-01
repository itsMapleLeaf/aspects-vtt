import { v } from "convex/values"
import { Console, Effect, Iterable, pipe } from "effect"
import { mutation } from "../lib/api.ts"

export const deleteUser = mutation({
	args: {
		handle: v.string(),
	},
	handler(ctx, { handle }) {
		return Effect.gen(function* () {
			const user = yield* ctx.db
				.query("users")
				.withIndex("handle", (q) => q.eq("handle", handle))
				.first()

			const account = yield* ctx.db
				.query("authAccounts")
				.withIndex("userIdAndProvider", (q) =>
					q.eq("userId", user._id).eq("provider", "credentials"),
				)
				.first()

			const sessions = yield* ctx.db
				.query("authSessions")
				.withIndex("userId", (q) => q.eq("userId", user._id))
				.collect()

			const tokens = yield* pipe(
				Effect.forEach(sessions, (session) =>
					ctx.db
						.query("authRefreshTokens")
						.withIndex("sessionId", (q) => q.eq("sessionId", session._id))
						.collect(),
				),
				Effect.map(Iterable.flatten),
			)

			yield* Effect.forEach([user, account, ...sessions, ...tokens], (doc) =>
				ctx.db.delete(doc._id),
			)
		}).pipe(
			Effect.filterOrDieMessage(
				() => process.env.TEST === "true",
				"Not in testing environment",
			),
			Effect.tapError(Console.error),
			Effect.ignore,
		)
	},
})
