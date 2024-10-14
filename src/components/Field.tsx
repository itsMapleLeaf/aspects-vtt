import { type ComponentProps, type ReactNode } from "react"
import { errorText, formField, labelText } from "~/styles/forms.ts"

export interface FieldProps extends ComponentProps<"div"> {
	label?: ReactNode
	htmlFor?: string
	errors?: string | string[]
}

export function Field({
	label,
	htmlFor,
	children,
	className,
	errors: errorsProp,
	...props
}: FieldProps) {
	let errors
	errors = [errorsProp].filter(Boolean).flat() // normalize to flat array
	errors = [...new Set(errors)] // dedupe
	return (
		<div {...props} className={formField(className)}>
			<label htmlFor={htmlFor} className={labelText()}>
				{label}
			</label>
			{children}
			{errors.map((error) => (
				<p key={error} className={errorText()}>
					{error}
				</p>
			))}
		</div>
	)
}
