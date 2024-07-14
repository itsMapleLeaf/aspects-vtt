import { brandedString } from "convex-helpers/validators"
import type { WithoutSystemFields } from "convex/server"
import { Effect } from "effect"
import type { Doc } from "./_generated/dataModel"
import type { Branded } from "./helpers/convex.ts"
import {
	Convex,
	effectQuery,
	internalEffectMutation,
	internalEffectQuery,
} from "./helpers/effect.ts"
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

export const upsert = internalEffectMutation({
	args: {
		...schema.tables.users.validator.fields,
	},
	handler(args) {
		return upsertUser(args)
	},
})

export const remove = internalEffectMutation({
	args: {
		clerkId: brandedString("clerkId"),
	},
	handler(args) {
		return getUserByClerkId(args.clerkId).pipe(
			Effect.flatMap((existing) => Convex.db.delete(existing._id)),
			Effect.catchTag("ConvexDocNotFoundError", () => Effect.void),
		)
	},
})

export function upsertUser(args: WithoutSystemFields<Doc<"users">>) {
	return getUserByClerkId(args.clerkId).pipe(
		Effect.flatMap((existing) => Convex.db.patch(existing._id, args)),
		Effect.catchTag("ConvexDocNotFoundError", () => Convex.db.insert("users", args)),
	)
}

export function getCurrentUser() {
	return Effect.gen(function* () {
		const identity = yield* Convex.auth.getUserIdentity()
		return yield* Convex.db
			.query("users")
			.withIndex("clerkId", (q) => q.eq("clerkId", identity.subject as Branded<"clerkId">))
			.first()
	})
}

export function getUserByClerkId(clerkId: Branded<"clerkId">) {
	return Convex.db
		.query("users")
		.withIndex("clerkId", (q) => q.eq("clerkId", clerkId))
		.first()
}
