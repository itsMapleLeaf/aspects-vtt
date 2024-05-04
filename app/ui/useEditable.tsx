import { type ComponentProps, type ComponentType, useState } from "react"
import type { Overwrite } from "../common/types.ts"

export interface EditableOptions<T> {
	value: T
	onSubmit: (value: T) => unknown
}

export type EditableComponentProps<Comp extends ComponentType, Value> = Overwrite<
	ComponentProps<Comp>,
	EditableOptions<Value>
>

interface ChangeEventLike<Value> {
	currentTarget: { value: Value }
}

const empty = Symbol()

export function useEditable<Value>({ value, onSubmit }: EditableOptions<Value>) {
	const [valueInternal, setValueInternal] = useState<Value | typeof empty>(empty)
	const [pending, setPending] = useState(false)

	function submit() {
		if (valueInternal === empty || valueInternal === value) {
			return
		}

		void (async () => {
			setPending(true)
			try {
				await onSubmit(valueInternal)
			} catch (error) {
				console.error(error)
			}
			setPending(false)
		})()
	}

	return {
		pending,
		submit,
		inputProps: <
			ChangeEvent extends ChangeEventLike<Value>,
			BlurEvent,
			KeyDownEvent extends React.KeyboardEvent,
		>(baseProps: {
			onChange?: (event: ChangeEvent) => void
			onBlur?: (event: BlurEvent) => void
			onKeyDown?: (event: KeyDownEvent) => void
		}) => ({
			value: valueInternal === empty ? value : valueInternal,
			onChange: (input: Value | ChangeEvent) => {
				if (pending) {
					return
				}

				if (typeof input === "object" && input !== null && "currentTarget" in input) {
					setValueInternal(input.currentTarget.value)
					baseProps.onChange?.(input)
				} else {
					setValueInternal(input)
				}
			},
			onBlur: (event: BlurEvent) => {
				baseProps.onBlur?.(event)
				submit()
			},
			onKeyDown: (event: KeyDownEvent) => {
				baseProps?.onKeyDown?.(event)
				if (event.key === "Escape") {
					event.preventDefault()
					event.stopPropagation()
					setValueInternal(empty)
				}
				if (event.key === "Enter") {
					event.preventDefault()
					event.stopPropagation()
					submit()
				}
			},
		}),
	}
}
