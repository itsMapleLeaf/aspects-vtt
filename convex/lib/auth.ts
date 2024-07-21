import { Data, Effect, pipe } from "effect"
import { Id } from "../_generated/dataModel"
import { auth } from "../auth.ts"
import { QueryContextService } from "./context.ts"
import { getDoc } from "./db.ts"

export class UnauthenticatedError extends Data.TaggedError(
	"UnauthenticatedError",
) {}

export class UserNotFoundError extends Data.TaggedError("UserNotFoundError") {
	constructor(readonly userId: Id<"users">) {
		super()
	}
}

export function getAuthUserId() {
	return pipe(
		QueryContextService,
		Effect.flatMap((ctx) => Effect.promise(() => auth.getUserId(ctx))),
		Effect.filterOrFail(
			(value): value is Id<"users"> => value != null,
			() => new UnauthenticatedError(),
		),
	)
}

export function getAuthUser() {
	return Effect.flatMap(getAuthUserId(), (userId) =>
		Effect.catchTag(getDoc(userId), "DocNotFoundError", () =>
			Effect.die(new UserNotFoundError(userId)),
		),
	)
}
