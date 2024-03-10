import * as Lucide from "lucide-react"
import type { ComponentPropsWithoutRef } from "react"
import { twMerge } from "tailwind-merge"
import type { Nullish, Overwrite } from "~/common/types.ts"

export function Select({
	options,
	value,
	onChange,
	className,
	...props
}: Overwrite<
	ComponentPropsWithoutRef<"select">,
	{
		options: { value: string | number; label: string }[]
		value: Nullish<string | number>
		onChange: (value: string) => void
	}
>) {
	return (
		<div className={twMerge("relative flex flex-row items-center", className)}>
			<select
				{...props}
				className="block h-10 w-full appearance-none rounded border border-primary-300 bg-primary-200 pl-9"
				value={value ?? ""}
				onChange={(event) => {
					onChange(event.target.value)
				}}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<Lucide.ChevronsUpDown className="pointer-events-none absolute left-2" />
		</div>
	)
}
