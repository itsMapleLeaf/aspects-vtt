import type { OptimisticLocalStore } from "convex/browser"
import { useMutation } from "convex/react"
import type {
	FunctionArgs,
	FunctionReference,
	FunctionReturnType,
} from "convex/server"
import { useActionState, useRef } from "react"
import { useAsyncState } from "./useAsyncState.ts"

export function useStableQueryValue<T>(
	value: T,
): readonly [value: T, pending: boolean] {
	const ref = useRef(value)
	if (ref.current !== value && value !== undefined) {
		ref.current = value
	}
	return [ref.current, value === undefined]
}

export function useMutationState<
	F extends FunctionReference<"mutation", "public">,
>(funcRef: F) {
	return useAsyncState(useMutation(funcRef))
}

export function useMutationAction<
	Func extends FunctionReference<"mutation", "public">,
>(func: Func) {
	const mutate = useMutation(func)
	return useActionState<
		FunctionReturnType<Func> | undefined,
		FunctionArgs<Func>
	>((_result, args) => mutate(args), undefined)
}

export interface QueryMutatorEntry<
	Query extends FunctionReference<"query", "public">,
> {
	value: FunctionReturnType<Query>
	args: FunctionArgs<Query>
	set: (value: FunctionReturnType<Query>) => void
}

export function* queryMutators<
	Query extends FunctionReference<"query", "public">,
>(
	store: OptimisticLocalStore,
	query: Query,
): Generator<QueryMutatorEntry<Query>, void, undefined> {
	for (const entry of store.getAllQueries(query)) {
		if (entry.value === undefined) continue
		yield {
			...entry,
			set(data) {
				store.setQuery(query, entry.args, data)
			},
		}
	}
}
