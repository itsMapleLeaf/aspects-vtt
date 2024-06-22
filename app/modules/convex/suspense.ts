import { ConvexHttpClient } from "convex/browser"
import { type OptionalRestArgsOrSkip, useConvex, useQuery } from "convex/react"
import {
	type FunctionReference,
	type FunctionReturnType,
	getFunctionName,
	type OptionalRestArgs,
} from "convex/server"
import { use, useEffect } from "react"
import { clientEnv } from "~/env.ts"

type PublicQuery = FunctionReference<"query", "public">

const cache = new Map<string, Promise<unknown>>()

export function useQuerySuspense<Q extends PublicQuery>(
	query: Q,
	...args: OptionalRestArgs<Q>
): FunctionReturnType<Q>

export function useQuerySuspense<Q extends PublicQuery>(
	query: Q,
	...args: OptionalRestArgsOrSkip<Q>
): FunctionReturnType<Q> | undefined

export function useQuerySuspense<Q extends PublicQuery>(
	query: Q,
	...args: OptionalRestArgsOrSkip<Q>
): FunctionReturnType<Q> | undefined {
	const convex = useConvex()
	const key = JSON.stringify([getFunctionName(query), ...args])
	let result = useQuery(query, ...args)

	if (result === undefined && args[0] !== "skip") {
		let promise = cache.get(key)
		if (promise === undefined) {
			if (typeof window !== "undefined") {
				promise = convex.query(query, ...(args as OptionalRestArgs<Q>))
			} else {
				promise = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL).query(
					query,
					...(args as OptionalRestArgs<Q>),
				)
			}
			cache.set(key, promise)
		}
		result = use(promise)
	}

	useEffect(() => {
		if (result !== undefined) {
			cache.set(key, Promise.resolve(result))
		}
	}, [key, result])

	return result
}
