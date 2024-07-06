import type { ComponentProps, ReactNode } from "react"
import { FormField } from "./Form.tsx"
import { NumberInput } from "./NumberInput.tsx"

export function NumberField({
	label,
	...props
}: ComponentProps<typeof NumberInput> & {
	label: ReactNode
}) {
	return (
		<FormField label={label}>
			<NumberInput {...props} />
		</FormField>
	)
}
