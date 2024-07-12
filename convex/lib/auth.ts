import { Data, Effect, pipe } from "effect"
import { QueryCtx } from "../_generated/server.js"
import { auth } from "../auth.ts"
import { Errors } from "../errors.ts"
import { FunctionContextService } from "./effect.ts"

export class UnauthenticatedError extends Data.TaggedError(
	"UnauthenticatedError",
) {}

export function getAuthUserId() {
	return pipe(
		FunctionContextService<QueryCtx>(),
		Effect.flatMap((ctx) => Effect.promise(() => auth.getUserId(ctx))),
		Effect.filterOrFail(
			(userId) => userId !== null,
			() => new UnauthenticatedError(),
		),
	)
}

export function getAuthUser() {
	return Effect.gen(function* () {
		const userId = yield* getAuthUserId()
		const ctx = yield* FunctionContextService<QueryCtx>()
		return yield* Effect.filterOrDie(
			Effect.promise(() => ctx.db.get(userId)),
			(user) => user !== null,
			() => new Error(Errors.USER_NOT_FOUND),
		)
	})
}
