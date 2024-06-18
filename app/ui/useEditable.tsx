import { useState } from "react"
import type { Awaitable, DietUnknown, Overwrite, PartialKeys, TODO } from "../helpers/types.ts"

export interface EditableOptions<T> {
	value: T
	validate?: (value: T) => string | undefined
	onSubmit: (value: T) => Awaitable<DietUnknown | typeof CancelSubmit>
	onChangeInternal?: (value: T) => void
}

interface BaseInputProps {
	onChange?: (event: TODO) => void
	onBlur?: (event: TODO) => void
	onKeyDown?: (event: TODO) => void
}

export type EditableProps<Props extends object, Value> = PartialKeys<
	Overwrite<Props, EditableOptions<Value>>,
	keyof BaseInputProps
>

interface ChangeEventLike<Value> {
	currentTarget: { value: Value }
}

const Empty = Symbol()
export const CancelSubmit = Symbol()

export function useEditable<Value, Props extends BaseInputProps>({
	value,
	validate,
	onSubmit,
	onChangeInternal,
	...baseProps
}: EditableOptions<Value> & Props) {
	const [valueInternal, setValueInternal] = useState<Value | typeof Empty>(Empty)
	const [pending, setPending] = useState(false)
	const validationError = valueInternal === Empty ? undefined : validate?.(valueInternal)
	const invalid = !!validationError

	function handleChangeInternal(value: Value) {
		setValueInternal(value)
		onChangeInternal?.(value)
	}

	function clearValue() {
		setValueInternal(Empty)
	}

	function submit(submitArg?: Value) {
		const submitted = submitArg ?? valueInternal
		if (submitted === Empty || submitted === value || invalid) {
			return
		}

		void (async () => {
			setPending(true)
			try {
				const result = await onSubmit(submitted)
				if (result !== CancelSubmit) {
					clearValue()
				}
			} catch (cause) {
				if (cause !== CancelSubmit) {
					console.error(cause)
				}
			}
			setPending(false)
		})()
	}

	return {
		pending,
		invalid,
		validationError,
		submit,
		inputProps: {
			...baseProps,
			value: valueInternal === Empty ? value : valueInternal,

			onChange: (input: Value | ChangeEventLike<Value>) => {
				if (pending) {
					return
				}

				if (typeof input === "object" && input !== null && "currentTarget" in input) {
					handleChangeInternal(input.currentTarget.value)
					baseProps.onChange?.(input)
				} else {
					handleChangeInternal(input)
				}
			},

			onBlur: (event: React.FocusEvent) => {
				baseProps.onBlur?.(event)
				submit()
			},

			onKeyDown: (event: React.KeyboardEvent) => {
				baseProps?.onKeyDown?.(event)
				if (event.key === "Escape") {
					event.preventDefault()
					event.stopPropagation()
					clearValue()
				}
				if (event.key === "Enter") {
					event.preventDefault()
					event.stopPropagation()
					submit()
				}
			},
		},
	}
}
