import { type ReactElement, cloneElement } from "react"
import { type FieldProps, Field } from "~/components/Field.tsx"
import type { FormState } from "./useForm.ts"

export interface FormFieldProps<Name extends string> extends FieldProps {
	form: FormState<Partial<Record<Name, string | number | undefined>>>
	name: Name
	children: ReactElement
}

export function FormField<Name extends string>({
	form,
	name,
	children,
	...props
}: FormFieldProps<Name>) {
	return (
		<Field
			{...form.getLabelProps(name)}
			errors={form.getFieldErrors(name)}
			{...props}
		>
			{cloneElement(children, form.getInputProps(name))}
		</Field>
	)
}
