import type { ReactNode } from "react"
import { type ClassNameValue, twMerge } from "tailwind-merge"
import { useField } from "./Form.tsx"
import { panel } from "./styles.ts"

export interface InputProps extends React.ComponentProps<"input">, InputStyleProps {
	icon?: ReactNode
}

export function Input({ icon, className, align, invalid, ...props }: InputProps) {
	const field = useField()
	return (
		<div className={twMerge("group relative flex w-full items-center", className)}>
			<div className="peer pointer-events-none absolute left-2 opacity-50 transition *:size-5 group-focus-within:opacity-100">
				{icon}
			</div>
			<input id={field.inputId} {...props} className={inputStyle({ align, invalid })} />
		</div>
	)
}

export interface InputStyleProps {
	align?: "left" | "right" | "center"
	invalid?: boolean
}

export function inputStyle(props: InputStyleProps, ...classes: ClassNameValue[]) {
	return panel(
		twMerge(
			"w-full h-10 min-w-0 rounded border border-primary-300 bg-primary-200 pl-8 pr-3 transition peer-empty:pl-3",
			props.align === "left" && "text-left",
			props.align === "right" && "text-right",
			props.align === "center" && "text-center",
			props.invalid && "border-red-500",
			...classes,
		),
	)
}
