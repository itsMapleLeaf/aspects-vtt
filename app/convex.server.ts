import { ConvexHttpClient } from "convex/browser"
import { Effect } from "effect"
import { getClerkAuth } from "./clerk.server.ts"
import { clientEnv } from "./env.ts"

export function getConvexClient() {
	return Effect.gen(function* () {
		const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL)
		const token = yield* getConvexAuthToken()
		if (token != null) {
			convex.setAuth(token)
		}
		return convex
	})
}

function getConvexAuthToken() {
	return Effect.gen(function* () {
		const auth = yield* getClerkAuth()
		return yield* Effect.tryPromise(() => auth.getToken({ template: "convex" }))
	})
}
