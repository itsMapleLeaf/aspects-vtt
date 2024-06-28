import type { UserIdentity } from "convex/server"
import { ConvexError } from "convex/values"
import { Effect } from "effect"
import { Result } from "../../app/helpers/Result.ts"
import type { QueryCtx } from "../_generated/server.js"
import type { Branded } from "../helpers/convex.js"
import { Convex, QueryCtxService } from "../helpers/effect.ts"
import { getCurrentUser, getUserByClerkId } from "../users.ts"

/** @deprecated */
export function getIdentity(ctx: QueryCtx) {
	return Result.fn(async () => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new Error("Not logged in")
		}
		return identity as UserIdentity & { subject: Branded<"clerkId"> }
	})
}

/** @deprecated */
export function getUserFromIdentity(ctx: QueryCtx) {
	return Result.fn(async () => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new ConvexError("Not logged in")
		}
		return await getUserByClerkId(identity.subject as Branded<"clerkId">).pipe(
			Effect.provideService(QueryCtxService, ctx),
			Effect.runPromise,
		)
	})
}

/** @deprecated */
export class UserNotFoundError {
	readonly _tag = "UserNotFoundError"
}

/** @deprecated */
export class UnauthorizedError {
	readonly _tag = "UnauthorizedError"
}

/** @deprecated */
export function getIdentityEffect() {
	return Convex.auth.getUserIdentity()
}

/** @deprecated */
export function getUserFromClerkId(clerkId: Branded<"clerkId">) {
	return getUserByClerkId(clerkId).pipe(
		Effect.catchTag("ConvexDocNotFoundError", () => Effect.fail(new UserNotFoundError())),
	)
}

/** @deprecated */
export function getUserFromIdentityEffect() {
	return getCurrentUser()
}
