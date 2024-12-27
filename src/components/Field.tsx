import { type ComponentProps, type ReactNode } from "react"
import * as v from "valibot"
import { errorText, formField, labelText } from "~/styles/forms.ts"
import { subText } from "~/styles/text"

export interface FieldProps extends ComponentProps<"div"> {
	label?: ReactNode
	htmlFor?: string
	errors?: string | string[]
	description?: ReactNode
}

export function getFieldProps<
	Schema extends v.GenericSchema<Record<string, string>, unknown>,
>(
	form: {
		errors: Partial<Record<keyof v.InferInput<Schema>, string>>
	},
	name: keyof v.InferInput<Schema> & string,
) {
	return {
		htmlFor: name,
		errors: form.errors[name],
	} satisfies Partial<FieldProps>
}

export function Field({
	label,
	htmlFor,
	children,
	className,
	errors: errorsProp,
	description,
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
			{description && <p className={subText()}>{description}</p>}
			{errors.map((error) => (
				<p key={error} className={errorText()}>
					{error}
				</p>
			))}
		</div>
	)
}
