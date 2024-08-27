import { Effect, pipe } from "effect"
import { Id } from "../_generated/dataModel"
import { auth } from "../auth.ts"
import { LocalQueryContext } from "./api.ts"
import { ConvexEffectError } from "@maple/convex-effect"

export class UnauthenticatedError extends ConvexEffectError {
	constructor() {
		super("You must be logged in to perform this action.")
	}
}

export class UserNotFoundError extends ConvexEffectError {
	constructor(userId: Id<"users">) {
		super(`User with ID "${userId}" not found.`)
	}
}

export function getAuthUserId(ctx: LocalQueryContext) {
	return pipe(
		Effect.promise(() => auth.getUserId(ctx.internal)),
		Effect.filterOrFail(
			(value): value is Id<"users"> => value != null,
			() => new UnauthenticatedError(),
		),
	)
}

export function getAuthUser(ctx: LocalQueryContext) {
	return pipe(
		getAuthUserId(ctx),
		Effect.flatMap((userId) => ctx.db.get(userId)),
		Effect.catchTag("DocNotFoundById", (cause) =>
			Effect.die(new Error("User not found", { cause })),
		),
	)
}
