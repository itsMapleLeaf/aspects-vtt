import { Iterator } from "iterator-helpers-polyfill"
import { useState } from "react"
import { labelText } from "./styles.ts"

export function AttributeField({
	name,
	label,
	defaultValue,
	value: valueProp,
	onChangeValue,
}: {
	name?: string
	label?: string
	defaultValue?: number
	value?: number
	onChangeValue?: (value: number) => void
}) {
	const [internalValue, setInternalValue] = useState(defaultValue ?? 1)
	const value = valueProp ?? internalValue

	const setValue = (value: number) => {
		setInternalValue(value)
		onChangeValue?.(value)
	}

	return (
		<div>
			<input type="hidden" name={name} value={value} />
			{label && <div className={labelText()}>{label}</div>}
			<div className="flex items-center gap-1.5">
				{Iterator.range(1, 5, 1, true)
					.map((i) => (
						<button
							key={i}
							type="button"
							className="size-6 rounded-full border-2 border-gray-300 bg-gray-300 bg-opacity-0 transition hover:bg-opacity-50 data-[active]:bg-opacity-100"
							data-active={i <= value || undefined}
							onClick={() => setValue(i)}
						>
							<span className="sr-only">Set to {i}</span>
						</button>
					))
					.toArray()}
			</div>
		</div>
	)
}
