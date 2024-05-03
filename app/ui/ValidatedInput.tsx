import { type Ref, useImperativeHandle, useState } from "react"
import { Input, type InputProps } from "./Input.tsx"

export type ValidatedInputController = {
	set: (value: string) => void
}

/**
 * An input which only calls onChange when the parse function returns a valid value,
 * keeping the invalid input for the user to fix
 */
export function ValidatedInput<T>({
	parse,
	onChangeValid,
	fallback,
	controllerRef,
	...props
}: InputProps & {
	parse: (input: string) => T
	onChangeValid: (parsed: NonNullable<T>) => void
	fallback?: T
	controllerRef?: Ref<ValidatedInputController>
}) {
	const [invalidValue, setInvalidValue] = useState<string>()
	const isFallback = invalidValue === "" && fallback != null

	const handleChange = (value: string) => {
		const parsed = parse(value)
		if (parsed != null) {
			setInvalidValue(undefined)
			onChangeValid(parsed)
		} else if (value === "" && fallback != null) {
			setInvalidValue("")
			onChangeValid(fallback)
		} else {
			setInvalidValue(value)
		}
	}

	useImperativeHandle(controllerRef, () => ({
		set(value) {
			handleChange(value)
		},
	}))

	return (
		<Input
			{...props}
			data-invalid={invalidValue !== undefined && !isFallback}
			placeholder={props.placeholder ?? String(fallback ?? "")}
			value={invalidValue ?? props.value}
			onChange={(event) => {
				props.onChange?.(event)
				handleChange(event.currentTarget.value)
			}}
		/>
	)
}
