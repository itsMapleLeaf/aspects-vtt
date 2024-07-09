import { brandedString } from "convex-helpers/validators"
import { v } from "convex/values"
import { Effect } from "effect"
import type { Branded } from "./helpers/convex.ts"
import { Convex, effectQuery, internalEffectMutation } from "./helpers/effect.ts"

export const me = effectQuery({
	handler() {
		return getCurrentUser().pipe(Effect.orElseSucceed(() => null))
	},
})

export const upsert = internalEffectMutation({
	args: {
		name: v.string(),
		avatarUrl: v.optional(v.string()),
		clerkId: brandedString("clerkId"),
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

export function upsertUser(args: {
	avatarUrl?: string | undefined
	name: string
	clerkId: string & { _: "clerkId" }
}) {
	return getUserByClerkId(args.clerkId).pipe(
		Effect.flatMap((existing) =>
			Convex.db.patch(existing._id, {
				name: args.name,
				avatarUrl: args.avatarUrl,
			}),
		),
		Effect.catchTag("ConvexDocNotFoundError", () =>
			Convex.db.insert("users", {
				name: args.name,
				avatarUrl: args.avatarUrl,
				clerkId: args.clerkId,
			}),
		),
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
