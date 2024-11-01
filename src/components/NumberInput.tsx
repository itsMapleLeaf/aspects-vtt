import { clamp } from "lodash-es"
import {
	startTransition,
	useActionState,
	useState,
	type ComponentProps,
} from "react"
import { toast } from "react-toastify"
import { twMerge } from "tailwind-merge"

export interface NumberInputProps
	extends Omit<ComponentProps<"input">, "value" | "placeholder"> {
	min?: number
	max?: number
	step?: number
	value?: number | null
	defaultValue?: number
	required?: boolean
	placeholder?: string | number
	onSubmitValue?: (value: number) => unknown
	onSubmitEmpty?: () => unknown
}

export function NumberInput({
	min = 0,
	max = Number.POSITIVE_INFINITY,
	step = 1,
	value: valueProp,
	required = true,
	onSubmitValue,
	onSubmitEmpty,
	...props
}: NumberInputProps) {
	const [editingValue, setEditingValue] = useState<string>()

	const [success, submit, pending] = useActionState(
		async (_success: boolean | undefined, _payload: void) => {
			if (editingValue === undefined) return true

			const input = editingValue.trim()
			if (input === String(valueProp)) return true

			if (!input) {
				if (required) return false
				onSubmitEmpty?.()
				return true
			}

			let value = parseInt(String(valueProp))

			if (input.startsWith("+")) {
				value += parseInt(input.slice(1))
			} else if (input.startsWith("-")) {
				value -= parseInt(input.slice(1))
			} else if (input.startsWith("*")) {
				value *= parseInt(input.slice(1))
			} else if (input.startsWith("/")) {
				value /= parseInt(input.slice(1))
			} else {
				value = parseInt(input)
			}

			if (!Number.isFinite(value)) {
				return false
			}

			try {
				await onSubmitValue?.(value)

				// queue this update for later,
				// so that the component can re-render first with the new value,
				// avoiding a "flicker of old value"
				startTransition(() => {
					setEditingValue(undefined)
				})
			} catch (error) {
				console.error(error)
				toast.error("Something went wrong. Check the console for details.")
				return false
			}

			return true
		},
	)

	function tweak(delta: number) {
		let value
		if (editingValue !== undefined) {
			value = parseInt(editingValue)
		} else {
			value = valueProp ?? props.defaultValue ?? min
		}
		setEditingValue(String(clamp(value + delta, min, max)))
	}

	return (
		// we're specifically avoiding the number type because it's finicky and bad
		<input
			inputMode="numeric"
			disabled={pending}
			{...props}
			placeholder={String(props.placeholder ?? 0)}
			className={twMerge("text-center tabular-nums", props.className)}
			value={editingValue ?? valueProp ?? ""}
			data-success={success || undefined}
			data-error={success === false || undefined}
			onChange={(event) => {
				setEditingValue(event.target.value)
			}}
			onBlur={() => {
				if (valueProp != null || !required) {
					startTransition(() => {
						submit()
					})
				}
			}}
			onKeyDown={(event) => {
				if (event.key === "Enter") {
					event.preventDefault()
					startTransition(() => {
						submit()
					})
				}
				if (event.key === "Escape") {
					event.preventDefault()
					setEditingValue(String(valueProp ?? min))
				}
				if (event.key === "ArrowUp") {
					event.preventDefault()
					tweak(step)
				}
				if (event.key === "ArrowDown") {
					event.preventDefault()
					tweak(-step)
				}
			}}
			ref={(element) => {
				if (!element) return

				const controller = new AbortController()

				// using a manual event listener for a non-passive listener
				// in order to cancel scrolling
				element.addEventListener(
					"wheel",
					(event) => {
						if (document.activeElement === element) {
							event.preventDefault()
							tweak(-Math.sign(event.deltaY) * step)
						}
					},
					{ signal: controller.signal },
				)

				return () => controller.abort()
			}}
		/>
	)
}
