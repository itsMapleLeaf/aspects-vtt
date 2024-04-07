import { type ComponentPropsWithoutRef, type ForwardedRef, type ReactNode, forwardRef } from "react"
import { type ClassNameValue, twMerge } from "tailwind-merge"
import { panel } from "./styles.ts"

export interface InputProps extends ComponentPropsWithoutRef<"input">, InputStyleProps {
	icon?: ReactNode
}

export const Input = forwardRef(function Input(
	{ icon, className, align, ...props }: InputProps,
	ref: ForwardedRef<HTMLInputElement>,
) {
	return (
		<div className={twMerge("group relative flex w-full items-center", className)}>
			<div className="peer pointer-events-none absolute left-2 opacity-50 transition *:size-5 group-focus-within:opacity-100">
				{icon}
			</div>
			<input {...props} className={inputStyle({ align }, "h-10")} ref={ref} />
		</div>
	)
})

export interface InputStyleProps {
	align?: "left" | "right" | "center"
}

export function inputStyle({ align }: InputStyleProps, ...classes: ClassNameValue[]) {
	return panel(
		twMerge(
			"w-full min-w-0 rounded border border-primary-300 bg-primary-200 pl-8 pr-3 transition peer-empty:pl-3",
			align === "left" && "text-left",
			align === "right" && "text-right",
			align === "center" && "text-center",
			...classes,
		),
	)
}
