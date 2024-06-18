import type { ComponentProps } from "react"
import type { Overwrite } from "../lib/types.ts"
import { EditableInput } from "./EditableInput.tsx"

export function EditableIntegerInput({
	min = 0,
	max = Number.POSITIVE_INFINITY,
	step = 1,
	onChange,
	...props
}: Overwrite<
	ComponentProps<typeof EditableInput>,
	{
		value: number
		min?: number
		max?: number
		step?: number
		onSubmit: (value: number) => unknown
	}
>) {
	return (
		<EditableInput
			{...props}
			value={String(props.value)}
			validate={function validateNumber(input) {
				const isNumberString = /^\d+$/.test(input)
				if (!isNumberString) return `Must be an integer`

				const number = Number(input)
				if (number < min) return `Must be ${min} or greater`
				if (number > max) return `Must be ${max} or less`
			}}
			onSubmit={async function handleSubmit(input) {
				await props.onSubmit(Number(input))
			}}
		/>
	)
}
