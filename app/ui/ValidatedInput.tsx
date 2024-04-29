import { useState } from "react"
import { Input, type InputProps } from "./Input.tsx"

/**
 * An input which only calls onChange when the parse function returns a valid value,
 * keeping the invalid input for the user to fix
 */
export function ValidatedInput<T>({
	parse,
	onChangeValid,
	...props
}: InputProps & {
	parse: (input: string) => T
	onChangeValid: (parsed: NonNullable<T>) => void
}) {
	const [invalidValue, setInvalidValue] = useState<string>()
	return (
		<Input
			{...props}
			data-invalid={invalidValue !== undefined}
			value={invalidValue ?? props.value}
			onChange={(event) => {
				props.onChange?.(event)
				const value = parse(event.currentTarget.value)
				if (value != null) {
					setInvalidValue(undefined)
					onChangeValid(value)
				} else {
					setInvalidValue(event.currentTarget.value)
				}
			}}
		/>
	)
}
