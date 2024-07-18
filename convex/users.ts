import { v } from "convex/values"
import { Effect, pipe } from "effect"
import type { Id } from "./_generated/dataModel"
import { auth } from "./auth.ts"
import {
	Convex,
	NotLoggedInError,
	QueryCtxService,
	effectQuery,
	internalEffectMutation,
	internalEffectQuery,
} from "./helpers/effect.ts"
import { partial } from "./helpers/partial.ts"
import schema from "./schema.ts"

export const me = effectQuery({
	handler() {
		return getCurrentUser().pipe(Effect.orElseSucceed(() => null))
	},
})

export const list = internalEffectQuery({
	handler() {
		return Convex.db.query("users").collect()
	},
})

export const update = internalEffectMutation({
	args: {
		...partial(schema.tables.users.validator.fields),
		id: v.id("users"),
	},
	handler({ id, ...args }) {
		return Convex.db.patch(id, args)
	},
})

export const remove = internalEffectMutation({
	args: {
		id: v.id("users"),
	},
	handler(args) {
		return Convex.db.delete(args.id)
	},
})

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

export function getCurrentUser() {
	return pipe(getCurrentUserId(), Effect.flatMap(Convex.db.get))
}
