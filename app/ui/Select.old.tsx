import * as Lucide from "lucide-react"
import type { ComponentPropsWithoutRef } from "react"
import { twMerge } from "tailwind-merge"
import type { Overwrite } from "../lib/types.ts"
import { panel } from "./styles.ts"

export type SelectValue = string | number | null

export interface SelectOption<T extends SelectValue> {
	value: T
	label: string
}

/** @deprecated */
export function Select<T extends SelectValue>({
	options,
	value,
	onChange,
	className,
	...props
}: Overwrite<
	ComponentPropsWithoutRef<"select">,
	{
		options: Array<SelectOption<T>>
		value: T
		onChange: (value: T) => void
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
				value={valueIndex ?? ""}
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
				<option value="" disabled>
					No option selected
				</option>
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
