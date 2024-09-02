import { ConvexError } from "convex/values"
import { ComponentProps } from "react"
import { toast, ToastOptions, ToastPromiseParams } from "react-toastify"
import { twMerge } from "tailwind-merge"
import { throttle } from "../../lib/async.ts"

export function toastAction<Result, Args extends unknown[]>(
	message: string,
	action: (...args: Args) => Promise<Result>,
	params: ToastPromiseParams<Result> = {},
	options?: Omit<ToastOptions<Result>, "action">,
) {
	return async (...args: Args) => {
		try {
			return await toast.promise(
				throttle(1000, action(...args)),
				{
					pending: message,
					...params,
				},
				options,
			)
		} catch (error) {
			console.error(error)
			toast.error(
				error instanceof ConvexError ? error.data : "Something went wrong. :(",
			)
		}
	}
}

export function ToastActionForm({
	action,
	message,
	...props
}: {
	action: (formData: FormData) => Promise<unknown>
	message: string
} & ComponentProps<"form">) {
	return (
		<form
			action={toastAction(message, action)}
			{...props}
			className={twMerge("contents", props.className)}
		/>
	)
}
