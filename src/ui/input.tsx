import { ComponentProps, useId } from "react"
import { Field } from "./form.tsx"
import { mergeClassProp } from "./helpers.ts"

export function Input(props: ComponentProps<"input">) {
	return (
		<input
			{...mergeClassProp(
				props,
				"rounded border border-base-700 bg-base-800 p-2 text-base-300",
			)}
		/>
	)
}

export function InputField({
	label,
	description,
	...props
}: ComponentProps<"input"> & {
	label: React.ReactNode
	description?: React.ReactNode
}) {
	const id = useId()
	const inputId = `${id}-input`
	const descriptionId = `${id}-description`
	return (
		<Field
			inputId={inputId}
			label={label}
			description={description}
			descriptionId={descriptionId}
		>
			<Input
				id={inputId}
				aria-describedby={descriptionId}
				{...mergeClassProp(props, "w-full")}
			/>
		</Field>
	)
}
