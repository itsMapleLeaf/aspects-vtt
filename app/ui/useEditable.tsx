import { type ComponentProps, type ComponentType, useState } from "react"
import type { Awaitable, Overwrite } from "../common/types.ts"
import type { DietUnknown } from "../common/types.ts"
import type { TODO } from "../common/types.ts"

export interface EditableOptions<T> {
	value: T
	validate?: (value: T) => string | undefined
	onSubmit: (value: T) => Awaitable<DietUnknown | typeof CancelSubmit>
	onChangeInternal?: (value: T) => void
}

export type EditableComponentProps<Comp extends ComponentType, Value> = Overwrite<
	ComponentProps<Comp>,
	EditableOptions<Value>
>

interface ChangeEventLike<Value> {
	currentTarget: { value: Value }
}

const Empty = Symbol()
export const CancelSubmit = Symbol()

export function useEditable<
	Value,
	Props extends {
		onChange?: (event: TODO) => void
		onBlur?: (event: TODO) => void
		onKeyDown?: (event: TODO) => void
	},
>({ value, validate, onSubmit, onChangeInternal, ...baseProps }: EditableOptions<Value> & Props) {
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

	function submit() {
		if (valueInternal === Empty || valueInternal === value || invalid) {
			return
		}

		void (async () => {
			setPending(true)
			try {
				const result = await onSubmit(valueInternal)
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
