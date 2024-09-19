import type { ComponentProps } from "react"
import { formField, labelText } from "~/styles/forms.ts"

export interface FormFieldProps extends ComponentProps<"div"> {
	label?: string
	inputId?: string
}

export function FormField({
	label,
	inputId,
	children,
	className,
	...props
}: FormFieldProps) {
	return (
		<div {...props} className={formField(className)}>
			<label htmlFor={inputId} className={labelText()}>
				{label}
			</label>
			{children}
		</div>
	)
}
