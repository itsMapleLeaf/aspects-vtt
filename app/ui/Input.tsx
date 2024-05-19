import { type ClassNameValue, twMerge } from "tailwind-merge"
import { useField } from "./Form.tsx"
import { panel } from "./styles.ts"

export interface InputProps
	extends React.ComponentProps<"input">,
		InputStyleProps {
	onChangeValue?: (value: string) => void
}

export function Input(props: InputProps) {
	const [inputStyleProps, inputProps] = extractInputStyleProps(props)
	const field = useField()
	return (
		<input
			id={field.inputId}
			{...inputProps}
			className={inputStyle(inputStyleProps, inputProps.className)}
			onChange={(event) => {
				props.onChange?.(event)
				props.onChangeValue?.(event.currentTarget.value)
			}}
		/>
	)
}

export interface InputStyleProps {
	align?: "left" | "right" | "center"
	invalid?: boolean
}

export function extractInputStyleProps<T extends InputStyleProps>({
	align,
	invalid,
	...rest
}: T) {
	return [{ align, invalid }, rest] as const
}

export function inputStyle(
	props: InputStyleProps,
	...classes: ClassNameValue[]
) {
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
