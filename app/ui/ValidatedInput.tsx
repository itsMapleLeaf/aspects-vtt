import { type Ref, useImperativeHandle, useState } from "react"
import { Input, type InputProps } from "./Input.tsx"

export type ValidatedInputController = {
	set: (value: string) => void
}

/**
 * An input which only calls onChange when the parse function returns a valid
 * value, keeping the invalid input for the user to fix
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
	const [state, setState] = useState<
		| { type: "empty"; value: string }
		| { type: "invalid"; value: string }
		| { type: "valid" }
	>({ type: "valid" })

	const handleChange = (value: string) => {
		if (value === "") {
			setState({ type: "empty", value })
			if (fallback != null) {
				onChangeValid(fallback)
			}
			return
		}

		const parsed = parse(value)
		if (parsed != null) {
			setState({ type: "valid" })
			onChangeValid(parsed)
			return
		}

		setState({ type: "invalid", value })
	}

	useImperativeHandle(controllerRef, () => ({
		set(value) {
			handleChange(value)
		},
	}))

	return (
		<Input
			{...props}
			invalid={
				state.type === "invalid" || (state.type === "empty" && fallback != null)
			}
			placeholder={props.placeholder ?? String(fallback ?? "")}
			value={
				state.type === "empty" || state.type === "invalid" ?
					state.value
				:	props.value
			}
			onChange={(event) => {
				props.onChange?.(event)
				handleChange(event.currentTarget.value)
			}}
		/>
	)
}
