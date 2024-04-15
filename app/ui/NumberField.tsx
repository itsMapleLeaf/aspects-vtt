import { useEffect, useId, useRef } from "react"
import { expect } from "#app/common/expect.js"
import { FormField } from "#app/ui/Form.js"
import { Input } from "#app/ui/Input.js"

export function NumberField(props: {
	label: string
	value: number
	onChange: (value: number) => void
}) {
	const inputRef = useRef<HTMLInputElement>(null)
	const inputId = useId()

	function setValue(newValue: number) {
		props.onChange(newValue)
	}

	useEffect(() => {
		const input = expect(inputRef.current, "input ref not set")

		const handleWheel = (event: WheelEvent) => {
			if (document.activeElement === event.currentTarget && event.deltaY !== 0) {
				event.preventDefault()
				event.stopPropagation()
				setValue(props.value - Math.sign(event.deltaY))
			}
		}

		input.addEventListener("wheel", handleWheel, { passive: false })
		return () => {
			input.removeEventListener("wheel", handleWheel)
		}
	})

	return (
		<FormField label={props.label} htmlFor={inputId}>
			<Input
				type="number"
				id={inputId}
				ref={inputRef}
				min={0}
				value={props.value}
				onChange={(event) => setValue(event.target.valueAsNumber)}
			/>
		</FormField>
	)
}
