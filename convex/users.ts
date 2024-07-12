import { Effect, pipe } from "effect"
import { query } from "./_generated/server"
import { getAuthUser } from "./lib/auth.ts"
import { endpoint } from "./lib/effect.ts"

export const me = endpoint(query, {
	handler: pipe(
		getAuthUser(),
		Effect.orElseSucceed(() => null),
	),
})
