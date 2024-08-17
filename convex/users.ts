import { NotLoggedIn } from "@maple/convex-effect"
import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { isNonNil } from "../common/validation.ts"
import {
	type LocalQueryCtx,
	internalMutation,
	internalQuery,
	query,
} from "./api.ts"
import { auth } from "./auth.ts"
import { partial } from "./helpers/partial.ts"
import schema from "./schema.ts"

export const me = query({
	handler(ctx) {
		return getCurrentUser(ctx).pipe(Effect.orElseSucceed(() => null))
	},
})

export const list = internalQuery({
	handler(ctx) {
		return ctx.db.query("users").collect()
	},
})

export const update = internalMutation({
	args: {
		...partial(schema.tables.users.validator.fields),
		id: v.id("users"),
	},
	handler(ctx, { id, ...args }) {
		return ctx.db.patch(id, args)
	},
})

export const remove = internalMutation({
	args: {
		id: v.id("users"),
	},
	handler(ctx, args) {
		return ctx.db.delete(args.id)
	},
})

export function getCurrentUserId(ctx: LocalQueryCtx) {
	return pipe(
		Effect.promise(() => auth.getUserId(ctx.internal)),
		Effect.filterOrFail(isNonNil, () => new NotLoggedIn()),
	)
}

export function getCurrentUser(ctx: LocalQueryCtx) {
	return pipe(
		getCurrentUserId(ctx),
		Effect.flatMap((id) => ctx.db.get(id)),
	)
}
