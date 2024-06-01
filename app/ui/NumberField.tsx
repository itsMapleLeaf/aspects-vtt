import type { ReactNode } from "react"
import { FormField } from "./Form.tsx"
import { NumberInput } from "./NumberInput.tsx"

export function NumberField(props: {
	label: ReactNode
	value: number
	min?: number
	onChange: (value: number) => void
}) {
	return (
		<FormField label={props.label}>
			<NumberInput value={props.value} min={props.min} onChange={props.onChange} />
		</FormField>
	)
}
