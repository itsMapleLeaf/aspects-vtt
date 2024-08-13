import { type ComponentProps, useRef } from "react"
import { clamp } from "../../common/math.ts"
import type { StrictOmit } from "../../common/types.ts"
import {
	ValidatedInput,
	type ValidatedInputController,
} from "./ValidatedInput.tsx"

type NumberInputProps = StrictOmit<
	Partial<ComponentProps<typeof ValidatedInput>>,
	"value" | "onChange"
> & {
	value: number
	onChange: (value: number) => void
	min?: number
	max?: number
	step?: number
	requireInteger?: boolean
	fallback?: number
}

export function NumberInput({
	value,
	onChange,
	min = 0, // this is a bad default generally, but Aspects rarely deals with negative numbers
	max = Number.POSITIVE_INFINITY,
	step = 1,
	requireInteger = true,
	fallback,
	...props
}: NumberInputProps) {
	const controllerRef = useRef<ValidatedInputController>(null)

	return (
		<ValidatedInput
			{...props}
			value={clamp(value, min, max)}
			fallback={fallback}
			controllerRef={controllerRef}
			parse={(input) => {
				const isNumberString = /^-?(\d+|\d*?\.\d+)$/.test(input)
				if (!isNumberString) return

				const value = Number(input)
				if (!Number.isFinite(value)) return
				if (value < min) return
				if (value > max) return
				if (requireInteger && !Number.isSafeInteger(value)) return

				return value
			}}
			onChangeValid={onChange}
			onKeyDown={(event) => {
				if (event.key === "ArrowUp") {
					tweak(event, 1)
				}
				if (event.key === "ArrowDown") {
					tweak(event, -1)
				}
			}}
			onWheel={(event) => {
				if (
					document.activeElement === event.currentTarget &&
					event.deltaY !== 0
				) {
					tweak(event, -Math.sign(event.deltaY))
				}
			}}
		/>
	)

	function tweak(event: React.SyntheticEvent<HTMLInputElement>, delta: number) {
		if (event.cancelable) event.preventDefault()
		let value = Number(event.currentTarget.value)
		if (!Number.isFinite(value)) value = 0
		controllerRef.current?.set(String(value + delta * step))
	}
}
