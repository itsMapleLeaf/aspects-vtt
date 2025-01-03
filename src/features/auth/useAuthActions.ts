import * as ConvexAuth from "@convex-dev/auth/react"
import type { InferInput } from "valibot"
import type { credentialsPayloadValidator } from "../../../lib/auth/validators.ts"

/** Typesafe wrapper around Convex Auth's useAuthActions */
export function useAuthActions() {
	const actions = ConvexAuth.useAuthActions()
	return {
		...actions,
		signInWithCredentials: (
			payload: InferInput<typeof credentialsPayloadValidator>,
		) => actions.signIn("credentials", payload),
		signInWithDiscord: () =>
			actions.signIn("discord", {
				redirectTo: window.location.pathname,
			}),
	}
}
