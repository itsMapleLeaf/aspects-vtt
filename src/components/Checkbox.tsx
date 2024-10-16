interface CheckboxProps {
	label: string
	checked: boolean
	onChange: (checked: boolean) => void
	disabled?: boolean
}

export function Checkbox({
	label,
	checked,
	onChange,
	disabled = false,
}: CheckboxProps) {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.checked)
	}

	return (
		<label className="flex items-center space-x-2">
			<input
				type="checkbox"
				checked={checked}
				onChange={handleChange}
				disabled={disabled}
				className="size-5 accent-accent-400"
			/>
			<span
				className={`select-none font-semibold ${disabled ? "text-gray-500" : ""}`}
			>
				{label}
			</span>
		</label>
	)
}
