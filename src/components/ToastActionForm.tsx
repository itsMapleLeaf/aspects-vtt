import { ConvexError } from "convex/values"
import { ComponentProps, useActionState } from "react"
import { toast } from "react-toastify"
import type { Except } from "type-fest"
import { sleep } from "~/lib/async.ts"

export interface ToastActionFormProps
	extends Except<ComponentProps<"form">, "action"> {
	action: (_state: unknown, formData: FormData) => Promise<unknown>
	pendingMessage?: string
	successMessage?: string
}

export function ToastActionForm({
	action,
	successMessage,
	pendingMessage,
	...props
}: ToastActionFormProps) {
	const [, formAction] = useToastAction(action, {
		successMessage,
		pendingMessage,
	})
	return <form {...props} action={formAction} />
}

export function useToastAction<State, Payload>(
	action: (
		state: Awaited<State> | undefined,
		payload: Payload,
	) => Promise<State | undefined>,
	options?: {
		pendingMessage?: string
		successMessage?: string
	},
) {
	return useActionState(
		async (state: Awaited<State> | undefined, payload: Payload) => {
			try {
				const promise = action(state, payload)
				if (options?.pendingMessage) {
					// ensure the promise runs for at least a second,
					// to keep the toast from blinking in and out
					toast.promise(Promise.all([promise, sleep(1000)]), {
						pending: options?.pendingMessage,
						success: options?.successMessage,
					})
				}
				return await promise
			} catch (error) {
				console.error(error)
				if (error instanceof ConvexError && typeof error.data === "string") {
					toast.error(error.data)
				} else {
					toast.error("Something went wrong. Try again.")
				}
			}
		},
		undefined,
	)
}
