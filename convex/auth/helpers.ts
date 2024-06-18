import { getOneFrom } from "convex-helpers/server/relationships"
import type { UserIdentity } from "convex/server"
import { ConvexError } from "convex/values"
import { Effect, pipe } from "effect"
import { Result } from "../../app/helpers/Result.ts"
import type { Overwrite } from "../../app/helpers/types.ts"
import type { QueryCtx } from "../_generated/server.js"
import type { Branded } from "../helpers/convex.js"
import { QueryCtxService, queryDoc, withQueryCtx } from "../helpers/effect.ts"

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
		return await Effect.runPromise(
			pipe(
				getUserFromClerkId(identity.subject as Branded<"clerkId">),
				Effect.provideService(QueryCtxService, ctx),
			),
		)
	})
}

export class NotLoggedInError {
	readonly _tag = "NotLoggedInError"
}

export class UserNotFoundError {
	readonly _tag = "UserNotFoundError"
}

export class UnauthorizedError {
	readonly _tag = "UnauthorizedError"
}

export function getIdentityEffect() {
	return withQueryCtx((ctx) => ctx.auth.getUserIdentity()).pipe(
		Effect.filterOrFail(
			(identity) => identity !== null,
			() => new NotLoggedInError(),
		),
		Effect.map((identity) => identity as Overwrite<UserIdentity, { subject: Branded<"clerkId"> }>),
	)
}

export function getUserFromClerkId(clerkId: Branded<"clerkId">) {
	return pipe(
		queryDoc(async (ctx) => await getOneFrom(ctx.db, "users", "clerkId", clerkId)),
		Effect.catchTag("ConvexDocNotFoundError", () => Effect.fail(new UserNotFoundError())),
	)
}

export function getUserFromIdentityEffect() {
	return getIdentityEffect().pipe(
		Effect.flatMap((identity) => getUserFromClerkId(identity.subject)),
	)
}
