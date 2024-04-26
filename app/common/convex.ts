import type { OptimisticLocalStore } from "convex/browser"
import { useMutation } from "convex/react"
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server"
import { useActionState, useRef } from "react"
import { useAsyncState } from "./useAsyncState.ts"

export function useStableQueryValue<T>(value: T): readonly [value: T, pending: boolean] {
	const ref = useRef(value)
	if (ref.current !== value && value !== undefined) {
		ref.current = value
	}
	return [ref.current, value === undefined]
}

export function useMutationState<F extends FunctionReference<"mutation", "public">>(funcRef: F) {
	return useAsyncState(useMutation(funcRef))
}

export function useMutationAction<Func extends FunctionReference<"mutation", "public">>(
	func: Func,
) {
	const mutate = useMutation(func)
	return useActionState<FunctionReturnType<Func> | undefined, FunctionArgs<Func>>(
		(_result, args) => mutate(args),
		undefined,
	)
}

export function applyOptimisticQueryUpdates<Query extends FunctionReference<"query", "public">>(
	store: OptimisticLocalStore,
	query: Query,
	update: (
		current: FunctionReturnType<Query>,
		args: FunctionArgs<Query>,
	) => FunctionReturnType<Query>,
) {
	for (const entry of store.getAllQueries(query)) {
		if (entry.value === undefined) continue
		store.setQuery(query, entry.args, update(entry.value, entry.args))
	}
}
