import { useQuery } from "convex/react"
import { FunctionReference } from "convex/server"
import { useFilter } from "./react.ts"
import { isNonNil } from "./validation.ts"

/**
 * A version of `useQuery` that only updates when the query is not loading. This
 * can help prevent "flicker of loading state" in places where the query args
 * change frequently.
 */
export function useStableQuery<
	Query extends FunctionReference<"query", "public">,
>(...args: Parameters<typeof useQuery<Query>>) {
	return useFilter(useQuery(...args), isNonNil)
}
