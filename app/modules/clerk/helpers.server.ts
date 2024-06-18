import { getAuth } from "@clerk/remix/ssr.server"
import { Effect } from "effect"
import { dataFunctionArgs } from "../../helpers/remix.ts"

export function getClerkAuth() {
	return Effect.gen(function* () {
		const args = yield* dataFunctionArgs()
		return yield* Effect.tryPromise(() => getAuth(args))
	})
}
