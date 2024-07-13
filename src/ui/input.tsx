import { ComponentProps } from "react"
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
	return (
		<Field label={label} description={description}>
			<Input {...mergeClassProp(props, "w-full")} />
		</Field>
	)
}
