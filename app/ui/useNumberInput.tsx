import { useState } from "react"

export function useNumberInput({
	defaultValue = 0,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	step = 1,
	requireInteger = true,
}: {
	defaultValue?: number
	min?: number
	max?: number
	step?: number
	requireInteger?: boolean
}) {
	const [input, setInput] = useState(String(defaultValue))
	const value = Number(input)

	const validationError = getValidationError({ input, value, requireInteger, min, max })
	const valid = validationError == null

	const setValue = (value: number) => setInput(String(value))

	const updateValue = (update: (number: number) => number) => {
		setInput(updateNumberString(input, update))
	}

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInput(event.target.value)
	}

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "ArrowUp") {
			event.preventDefault()
			setInput((value) => updateNumberString(value, (value) => value + step))
		}
		if (event.key === "ArrowDown") {
			event.preventDefault()
			setInput((value) => updateNumberString(value, (value) => value - step))
		}
	}

	const onWheel = (event: React.WheelEvent<HTMLInputElement>) => {
		if (document.activeElement === event.currentTarget && event.deltaY !== 0) {
			event.preventDefault()
			setInput((value) => updateNumberString(value, (value) => value - Math.sign(event.deltaY)))
		}
	}

	return {
		input,
		setInput,

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
	if (requireInteger && !Number.isSafeInteger(value)) return `Must be a whole number`
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
