import { ComponentProps } from "react"
import { useFormStatus } from "react-dom"
import { Loading } from "./loading.tsx"

export function FormButton({ children, ...props }: ComponentProps<"button">) {
	const status = useFormStatus()
	return (
		<button disabled={status.pending} {...props} type="submit">
			{status.pending ? <Loading data-button-icon /> : children}
		</button>
	)
}
