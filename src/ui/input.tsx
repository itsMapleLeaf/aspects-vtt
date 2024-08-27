import React, { ComponentProps, useId } from "react"
import { FormField, FormInputState } from "./form.tsx"
import { mergeClassProp } from "./helpers.ts"
import { twMerge } from "tailwind-merge"

export function Input(props: ComponentProps<"input">) {
	return <input {...mergeClassProp(props, "input")} />
}

export function InputField({
	label,
	description,
	onValueChange,
	...props
}: ComponentProps<"input"> & {
	label: React.ReactNode
	description?: React.ReactNode
	onValueChange?: (value: string) => void
}) {
	const id = useId()
	const inputId = `${id}-input`
	const descriptionId = `${id}-description`
	return (
		<FormField
			inputId={inputId}
			label={label}
			description={description}
			descriptionId={descriptionId}
		>
			<input
				id={inputId}
				aria-describedby={descriptionId}
				{...props}
				className={twMerge(
					"h-10 w-full min-w-0 rounded-md border border-primary-700 bg-primary-900 px-3 transition",
					props.className,
				)}
				onChange={(event) => {
					props.onChange?.(event)
					onValueChange?.(event.target.value)
				}}
			/>
		</FormField>
	)
}

export function useInput(initialValue: string) {
	const [value, setValue] = React.useState(initialValue)
	return {
		value,
		setValue,
		props<
			BaseProps extends {
				onChange?: (event: React.ChangeEvent<ElementType>) => void
			},
			ElementType extends { value: string },
		>(baseProps?: BaseProps) {
			return {
				...baseProps,
				value,
				onChange: (event: React.ChangeEvent<ElementType>) => {
					baseProps?.onChange?.(event)
					setValue(event.target.value)
				},
			}
		},
	} satisfies FormInputState
}
