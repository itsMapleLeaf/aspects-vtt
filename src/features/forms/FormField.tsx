import { type FieldProps, Field } from "~/components/Field.tsx"
import type { FieldAccessor } from "./useForm.ts"

export interface FormFieldProps extends FieldProps {
	field: FieldAccessor
}

export function FormField({ field, children, ...props }: FormFieldProps) {
	return (
		<Field {...field.label} errors={field.errors} {...props}>
			{children}
		</Field>
	)
}
