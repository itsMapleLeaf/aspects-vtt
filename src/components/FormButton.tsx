import type { ComponentProps } from "react"
import type { StrictOmit } from "~/lib/types.ts"
import { Button } from "./Button.tsx"
import { ToastActionForm } from "./ToastActionForm.tsx"

export interface FormButtonProps
	extends StrictOmit<ComponentProps<typeof Button>, "type"> {
	action: () => Promise<unknown>
	pendingMessage?: string
	successMessage?: string
}

export function FormButton({
	action,
	pendingMessage,
	successMessage,
	...props
}: FormButtonProps) {
	return (
		<ToastActionForm
			action={action}
			pendingMessage={pendingMessage}
			successMessage={successMessage}
			className="contents"
		>
			<Button type="submit" {...props} />
		</ToastActionForm>
	)
}
