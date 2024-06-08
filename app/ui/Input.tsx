import { type ClassNameValue, twMerge } from "tailwind-merge"
import { useField } from "./Form.tsx"
import { panel } from "./styles.ts"
import { Tooltip } from "./Tooltip.tsx"

export interface InputProps extends React.ComponentProps<"input">, InputStyleProps {
	icon?: React.ReactNode
	tooltip?: React.ReactNode
	onChangeValue?: (value: string) => void
}

export function Input({ icon, tooltip, onChangeValue, ...props }: InputProps) {
	const [inputStyleProps, inputProps] = extractInputStyleProps(props)
	const field = useField()

	const inputElement = (
		<input
			id={field.inputId}
			{...inputProps}
			className={inputStyle(inputStyleProps, icon && "pl-9", inputProps.className)}
			onChange={(event) => {
				props.onChange?.(event)
				onChangeValue?.(event.currentTarget.value)
			}}
		/>
	)

	return (
		<div className="relative flex items-center">
			<div className="pointer-events-none absolute left-2 opacity-50 *:size-5 empty:hidden">
				{icon}
			</div>
			{tooltip == null ? inputElement : <Tooltip content={tooltip}>{inputElement}</Tooltip>}
		</div>
	)
}

export interface InputStyleProps {
	align?: "left" | "right" | "center"
	invalid?: boolean
}

export function extractInputStyleProps<T extends InputStyleProps>({ align, invalid, ...rest }: T) {
	return [{ align, invalid }, rest] as const
}

export function inputStyle(props: InputStyleProps, ...classes: ClassNameValue[]) {
	return panel(
		twMerge(
			"h-10 w-full min-w-0 rounded border border-primary-300 bg-primary-200 px-3 ring-inset transition",
			props.align === "left" && "text-left",
			props.align === "right" && "text-right",
			props.align === "center" && "text-center",
			props.invalid && "border-red-500",
			...classes,
		),
	)
}
