import { startTransition } from "react"
import { useToastAction } from "./ToastActionForm.tsx"

interface CheckboxProps {
	label: string
	checked: boolean
	onChange: (checked: boolean) => unknown
	disabled?: boolean
}

export function Checkbox({
	label,
	checked,
	onChange,
	disabled,
}: CheckboxProps) {
	const [, handleChange, pending] = useToastAction(
		async (_state, checked: boolean) => {
			await onChange(checked)
		},
	)

	return (
		<label className="flex items-center space-x-2 transition-opacity has-disabled:opacity-50">
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => {
					startTransition(() => {
						handleChange(event.target.checked)
					})
				}}
				disabled={disabled ?? pending}
				className="accent-accent-400 size-5"
			/>
			<span
				className={`font-semibold select-none ${disabled ? "text-gray-500" : ""}`}
			>
				{label}
			</span>
		</label>
	)
}
