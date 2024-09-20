import type { ComponentProps } from "react"
import { formField, labelText } from "~/styles/forms.ts"

export interface FormFieldProps extends ComponentProps<"div"> {
	label?: string
	htmlFor?: string
}

export function FormField({
	label,
	htmlFor,
	children,
	className,
	...props
}: FormFieldProps) {
	return (
		<div {...props} className={formField(className)}>
			<label htmlFor={htmlFor} className={labelText()}>
				{label}
			</label>
			{children}
		</div>
	)
}
