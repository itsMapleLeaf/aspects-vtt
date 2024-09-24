import { type ComponentProps, type ReactNode } from "react"
import { errorText, formField, labelText } from "~/styles/forms.ts"

export interface FieldProps extends ComponentProps<"div"> {
	label?: ReactNode
	htmlFor?: string
	errors?: string[]
}

export function Field({
	label,
	htmlFor,
	children,
	className,
	errors,
	...props
}: FieldProps) {
	return (
		<div {...props} className={formField(className)}>
			<label htmlFor={htmlFor} className={labelText()}>
				{label}
			</label>
			{children}
			{[...new Set(errors)]?.map((error) => (
				<p key={error} className={errorText()}>
					{error}
				</p>
			))}
		</div>
	)
}
