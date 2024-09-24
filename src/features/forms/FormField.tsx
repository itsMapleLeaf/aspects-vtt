import type { StrictOmit } from "~/common/types.ts"
import { type FieldProps, Field } from "~/components/Field.tsx"
import type { FieldAccessor } from "./useForm.ts"

export interface FormFieldProps extends FieldProps {
	field: StrictOmit<FieldAccessor, "set">
}

export function FormField({ field, children, ...props }: FormFieldProps) {
	return (
		<Field {...field.label} errors={field.errors} {...props}>
			{children}
		</Field>
	)
}
