import { ConvexError } from "convex/values"
import { Effect } from "effect"
import { Result } from "#app/common/Result.js"
import type { QueryCtx } from "./_generated/server"
import { type Branded, QueryCtxService } from "./helpers.ts"

/** @deprecated */
export function getUserFromIdentity(ctx: QueryCtx) {
	return Result.fn(async () => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new ConvexError("Not logged in")
		}
		return await Effect.runPromise(
			getUserFromClerkId(identity.subject as Branded<"clerkId">).pipe(QueryCtxService.provide(ctx)),
		)
	})
}

export function getUserFromClerkId(clerkId: Branded<"clerkId">) {
	return Effect.gen(function* () {
		const ctx = yield* QueryCtxService
		const user = yield* Effect.tryPromise(() => {
			return ctx.db
				.query("users")
				.withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
				.unique()
		})
		return yield* Effect.fromNullable(user)
	})
}

export function getUserFromIdentityEffect() {
	return Effect.gen(function* () {
		const ctx = yield* QueryCtxService
		const identity = yield* Effect.tryPromise(() => ctx.auth.getUserIdentity())
		if (!identity) {
			return yield* Effect.fail(new ConvexError("Not logged in"))
		}
		return yield* getUserFromClerkId(identity.subject as Branded<"clerkId">)
	})
}
