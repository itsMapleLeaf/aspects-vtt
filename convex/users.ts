import { Effect } from "effect"
import { getAuthUser } from "./lib/auth.ts"
import { runConvexEffect } from "./lib/effects.ts"
import { query } from "./lib/ents.ts"

export const me = query({
	async handler(ctx) {
		return runConvexEffect(
			getAuthUser(ctx).pipe(Effect.orElseSucceed(() => null)),
		)
	},
})
