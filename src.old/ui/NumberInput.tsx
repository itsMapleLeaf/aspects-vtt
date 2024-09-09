import React, { ComponentProps, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { StrictOmit } from "../lib/types.ts"

export interface NumberInputProps
	extends UseNumberInputOptions,
		StrictOmit<ComponentProps<"input">, keyof UseNumberInputOptions> {}

export function NumberInput<Others>(props: NumberInputProps & Others) {
	const input = useNumberInput(props)
	return (
		<input
			{...input.inputProps}
			data-valid={input.valid || undefined}
			data-invalid={!input.valid || undefined}
			className={twMerge("text-center tabular-nums", props.className)}
		/>
	)
}

export interface UseNumberInputOptions {
	defaultValue?: string | number
	min?: number
	max?: number
	step?: number
}

export interface InputLike {
	value: string
}

export function useNumberInput<Others>({
	defaultValue = "",
	min = 0,
	max = Number.POSITIVE_INFINITY,
	step = 1,
	...props
}: UseNumberInputOptions & Others) {
	const [input, setInput] = useState(String(defaultValue))
	const [element, elementRef] = useState<HTMLInputElement | null>(null)

	const value = input.trim() ? Number(input) : null

	const errorMessage =
		value == null ? "Value is required"
		: !Number.isInteger(value) ? "Value must be a valid integer"
		: value < min ? `Value must be ${min} or greater`
		: value > max ? `Value must be ${max} or less`
		: undefined

	const valid = !errorMessage

	useEffect(() => {
		if (!element) return
		element.setCustomValidity(errorMessage ?? "")
	}, [element, errorMessage])

	const onChange = (event: React.ChangeEvent<InputLike>) => {
		setInput(event.currentTarget.value)
	}

	const onKeyDown = (event: React.KeyboardEvent<InputLike>) => {
		let delta = 0

		if (event.key === "ArrowUp") {
			delta = step
		}
		if (event.key === "ArrowDown") {
			delta = -step
		}

		if (delta === 0) {
			return
		}

		if (event.ctrlKey) {
			delta *= 5
		}
		if (event.shiftKey) {
			delta *= 10
		}

		setInput(String(Number.isFinite(value) ? (value ?? 0) + delta : delta))
	}

	const inputProps = {
		...props,
		type: "text",
		inputMode: "numeric",
		value: input,
		ref: elementRef,
		onChange,
		onKeyDown,
	} satisfies ComponentProps<"input">

	return {
		input,
		setInput,
		inputProps,
		value,
		valid,
		errorMessage,
		ref: elementRef,
	}
}
