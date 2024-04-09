import { useMutation } from "convex/react"
import type { FunctionReference } from "convex/server"
import { useRef } from "react"
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
