import { useState } from "react"
import type { StrictOmit } from "~/helpers/types.ts"

export interface NumberInputOptions {
	value: string
	onChangeValue: (value: string) => void
	defaultValue?: number
	min?: number
	max?: number
	step?: number
	requireInteger?: boolean
}

export function useNumberInput({
	defaultValue = 0,
	...options
}: StrictOmit<NumberInputOptions, "value" | "onChangeValue">) {
	const [input, setInput] = useState(String(defaultValue))
	return {
		input,
		setInput,
		...useControlledNumberInput({
			...options,
			value: input,
			onChangeValue: setInput,
		}),
	}
}

export function useControlledNumberInput({
	value: input,
	onChangeValue,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	step = 1,
	requireInteger = true,
}: StrictOmit<NumberInputOptions, "defaultValue">) {
	const value = Number(input)

	const validationError = getValidationError({
		input,
		value,
		requireInteger,
		min,
		max,
	})
	const valid = validationError == null

	const setValue = (value: number) => onChangeValue(String(value))

	const updateValue = (update: (number: number) => number) => {
		onChangeValue(updateNumberString(input, update))
	}

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChangeValue(event.target.value)
	}

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "ArrowUp") {
			event.preventDefault()
			onChangeValue(updateNumberString(input, (value) => value + step))
		}
		if (event.key === "ArrowDown") {
			event.preventDefault()
			onChangeValue(updateNumberString(input, (value) => value - step))
		}
	}

	const onWheel = (event: React.WheelEvent<HTMLInputElement>) => {
		if (document.activeElement === event.currentTarget && event.deltaY !== 0) {
			event.preventDefault()
			onChangeValue(
				updateNumberString(input, (value) => value - Math.sign(event.deltaY)),
			)
		}
	}

	return {
		value,
		setValue,
		updateValue,

		valid,
		validationError,

		props: {
			value: input,
			invalid: !valid,
			onChange,
			onKeyDown,
			onWheel,
		},
	}
}

function getValidationError({
	input,
	value,
	requireInteger,
	min,
	max,
}: {
	input: string
	value: number
	requireInteger: boolean
	min: number
	max: number
}) {
	if (input === "") return "Required"
	if (!Number.isFinite(value)) return `Must be a valid number`
	if (requireInteger && !Number.isSafeInteger(value))
		return `Must be a whole number`
	if (value < min) return `Must be ${min} or higher`
	if (value > max) return `Must be ${max} or lower`
}

function updateNumberString(value: string, update: (number: number) => number) {
	const number = Number(value)
	if (Number.isNaN(number)) {
		return value
	}
	return String(update(number))
}
