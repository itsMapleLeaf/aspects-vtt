import { useMutation } from "convex/react"
import type { FunctionReference } from "convex/server"
import { ConvexError } from "convex/values"
import { useActionState, useRef } from "react"
import { useAsyncState } from "~/helpers/react/hooks.ts"
import type { Awaitable, Exhaustive } from "~/helpers/types.ts"
import { useToaster } from "~/ui/Toaster.tsx"

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

export type ActionState<T> = Exhaustive<
	| { type: "idle" }
	| { type: "success"; value: T }
	| { type: "error"; value?: T; error: NonNullable<unknown> }
>

export function useSafeAction<Result, Payload = void>(fn: (payload: Payload) => Awaitable<Result>) {
	const toaster = useToaster()
	return useActionState<ActionState<Result>, Payload>(
		async (current, args) => {
			try {
				const value = await fn(args)
				return { type: "success", value }
			} catch (error) {
				toaster.error({
					title: "Something went wrong :(",
					body: error instanceof ConvexError ? error.message : undefined,
				})
				return { type: "error", value: current.value, error: error != null ? error : new Error() }
			}
		},
		{ type: "idle" },
	)
}

export function useMutationAction<Func extends FunctionReference<"mutation", "public">>(
	func: Func,
) {
	return useSafeAction(useMutation(func))
}
