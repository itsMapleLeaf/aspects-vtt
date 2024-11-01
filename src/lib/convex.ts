import { useMutation } from "convex/react"
import {
	FunctionArgs,
	FunctionReference,
	FunctionReturnType,
} from "convex/server"
import { ConvexError } from "convex/values"
import { startTransition, useActionState } from "react"
import { toast } from "react-toastify"

export function useToastMutation<FuncRef extends FunctionReference<"mutation">>(
	...args: Parameters<typeof useMutation<FuncRef>>
) {
	const baseMutate = useMutation(...args)

	const mutate = async (args: FunctionArgs<FuncRef>) => {
		try {
			return await baseMutate(args)
		} catch (error) {
			if (error instanceof ConvexError && typeof error.data === "string") {
				toast.error(error.data)
			} else {
				toast.error("Something went wrong. Check the console for details.")
			}
			throw error
		}
	}

	type ActionInput = {
		args: FunctionArgs<FuncRef>
		onSuccess?: (data: FunctionReturnType<FuncRef>) => void
		onError?: (error: unknown) => void
	}

	const [state, action, pending] = useActionState(
		async (
			_state:
				| {
						readonly success: true
						readonly data: Awaited<FunctionReturnType<FuncRef>>
						readonly error?: undefined
				  }
				| {
						readonly success: false
						readonly error: unknown
						readonly data?: undefined
				  }
				| undefined,
			input: ActionInput,
		) => {
			try {
				const data = await mutate(input.args)
				input.onSuccess?.(data)
				return { success: true, data } as const
			} catch (error) {
				input.onError?.(error)
				return { success: false, error } as const
			}
		},
		undefined,
	)

	return {
		/**
		 * The underlying mutation function, which shows a toast on error and
		 * rethrows it.
		 */
		mutate,

		/**
		 * A wrapper around the mutation function as a react action, meant to be
		 * used as a prop to a `<form>`.
		 */
		formAction: action,

		/**
		 * Calls `formAction` wrapped with `startTransition()`, for triggering the
		 * action from arbitrary places.
		 */
		action: (input: ActionInput) => {
			startTransition(() => {
				action(input)
			})
		},

		/**
		 * The state of the action call, returning the mutation result on success,
		 * or an error on failure.
		 */
		state,

		/** Whether the action is pending. */
		pending,
	}
}
