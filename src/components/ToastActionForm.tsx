import { ConvexError } from "convex/values"
import { ComponentProps, useActionState } from "react"
import { toast } from "react-toastify"
import { sleep } from "~/common/async.ts"

export function ToastActionForm({
	action,
	successMessage,
	pendingMessage,
	...props
}: ComponentProps<"form"> & {
	action: (_state: unknown, formData: FormData) => Promise<unknown>
	pendingMessage?: string
	successMessage?: string
}) {
	const [, formAction] = useToastAction(action, {
		successMessage,
		pendingMessage,
	})
	return <form {...props} action={formAction} />
}

export function useToastAction<State, Payload = void>(
	action: (
		state: State | undefined,
		payload: Payload,
	) => Promise<State | undefined>,
	options?: {
		pendingMessage?: string
		successMessage?: string
	},
) {
	return useActionState(async (state: State | undefined, payload: Payload) => {
		try {
			let promise = Promise.all([
				action(state, payload),
				// ensure the promise runs for at least a second,
				// to keep the toast from blinking in and out
				sleep(1000),
			])
			if (options?.pendingMessage) {
				promise = toast.promise(promise, {
					pending: options?.pendingMessage,
					success: options?.successMessage,
				})
			}
			const [result] = await promise
			return result
		} catch (error) {
			console.error(error)
			if (error instanceof ConvexError && typeof error.data === "string") {
				toast.error(error.data)
			} else {
				toast.error("Something went wrong. Try again.")
			}
		}
	})
}
