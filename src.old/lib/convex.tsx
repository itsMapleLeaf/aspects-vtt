import { useQuery } from "convex/react"
import { FunctionReference, SystemTableNames } from "convex/server"
import * as v from "valibot"
import { Id, TableNames } from "../../convex/_generated/dataModel"
import { isNonNil } from "./guards.ts"
import { useFilter } from "./react.ts"

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

export function convexIdValidator<T extends TableNames | SystemTableNames>() {
	return v.custom<Id<T>>((value) => typeof value === "string")
}

export function QueryResult<T>({
	data,
	renderLoading,
	renderEmpty,
	renderData,
}: {
	data: T | undefined | null
	renderLoading: () => React.ReactNode
	renderEmpty: () => React.ReactNode
	renderData: (data: T) => React.ReactNode
}) {
	return (
		data === undefined ? renderLoading()
		: data === null ? renderEmpty()
		: renderData(data)
	)
}
