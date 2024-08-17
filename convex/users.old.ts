import { Effect, pipe } from "effect"
import type { Id } from "./_generated/dataModel"
import { auth } from "./auth.ts"
import { Convex, NotLoggedInError, QueryCtxService } from "./helpers/effect.ts"

/** @deprecated */
export function getCurrentUserId() {
	return pipe(
		QueryCtxService,
		Effect.flatMap((ctx) => Effect.promise(() => auth.getUserId(ctx))),
		Effect.filterOrFail(
			(id): id is Id<"users"> => id != null,
			() => new NotLoggedInError(),
		),
	)
}

/** @deprecated */
export function getCurrentUser() {
	return pipe(getCurrentUserId(), Effect.flatMap(Convex.db.get))
}
