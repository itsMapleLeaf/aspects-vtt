import type { Nullish } from "~/common/types.ts"

export function Select<T extends string>({
	options,
	value,
	onChange,
}: {
	options: { value: T; label: string }[]
	value: Nullish<T>
	onChange: (value: T) => void
}) {
	return (
		<select
			className="block h-10 w-full appearance-none rounded border border-primary-300 bg-primary-200 pl-9"
			value={value ?? ""}
			onChange={(event) => {
				onChange(event.target.value as T)
			}}
		>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	)
}
