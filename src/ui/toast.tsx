import { ComponentProps } from "react"
import { toast, ToastOptions, ToastPromiseParams } from "react-toastify"
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
					error: "Sorry, something went wrong.",
					...params,
				},
				options,
			)
		} catch (data) {
			return console.error(data)
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
			className="contents"
		/>
	)
}
