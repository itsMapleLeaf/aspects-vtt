import { Data, Effect, pipe } from "effect"
import { Id } from "../_generated/dataModel"
import { auth } from "../auth.ts"
import { LocalQueryContext } from "./api.ts"

export class UnauthenticatedError extends Data.TaggedError(
	"UnauthenticatedError",
) {}

export class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
	userId: Id<"users">
}> {}

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
		Effect.catchTag("DocNotFound", (cause) =>
			Effect.die(new Error("User not found", { cause })),
		),
	)
}
