import * as Lucide from "lucide-react"
import type { ComponentPropsWithoutRef } from "react"
import { twMerge } from "tailwind-merge"
import type { Overwrite } from "#app/common/types.ts"
import { panel } from "./styles.ts"

export function Select<T extends string | number | null>({
	options,
	value,
	onChange,
	className,
	...props
}: Overwrite<
	ComponentPropsWithoutRef<"select">,
	{
		options: { value: T; label: string }[]
		value?: T
		onChange?: (value: T) => void
	}
>) {
	let valueIndex: number | undefined = options.findIndex((option) => option.value === value)
	if (valueIndex === -1) {
		valueIndex = undefined
	}

	return (
		<div className={twMerge("relative flex flex-row items-center", className)}>
			<select
				{...props}
				className={panel("block h-10 w-full appearance-none pl-9")}
				value={valueIndex}
				onChange={(event) => {
					const index = Number(event.target.value)
					const newValue = options[index]?.value
					if (newValue === undefined) {
						throw new Error(
							`Invalid select value. ${JSON.stringify({
								value: event.target.value,
								options,
								index,
							})}`,
						)
					}
					onChange?.(newValue)
				}}
			>
				{options.map((option, index) => (
					<option key={option.value} value={index}>
						{option.label}
					</option>
				))}
			</select>
			<Lucide.ChevronsUpDown className="pointer-events-none absolute left-2" />
		</div>
	)
}
