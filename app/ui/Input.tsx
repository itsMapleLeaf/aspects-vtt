import { type ReactElement, type ReactNode, cloneElement } from "react"
import { type ClassNameValue, twMerge } from "tailwind-merge"
import type { Disallowed, StrictOmit } from "../common/types.ts"
import { panel } from "./styles.ts"

interface InputPropsBase extends InputStyleProps {
	icon?: ReactNode
}

interface InputPropsAsInput extends InputPropsBase, React.ComponentProps<"input"> {}

interface InputPropsAsElement
	extends StrictOmit<Disallowed<React.ComponentProps<"input">>, "className">,
		InputPropsBase {
	element: ReactElement<{ className?: string }>
	className?: string
}

export type InputProps = InputPropsAsInput | InputPropsAsElement

export function Input({ icon, className, align, ...props }: InputProps) {
	return (
		<div className={twMerge("group relative flex w-full items-center", className)}>
			<div className="peer pointer-events-none absolute left-2 opacity-50 transition *:size-5 group-focus-within:opacity-100">
				{icon}
			</div>
			{"element" in props ? (
				cloneElement(props.element, { className: inputStyle({ align }) })
			) : (
				<input {...props} className={inputStyle({ align })} />
			)}
		</div>
	)
}

export interface InputStyleProps {
	align?: "left" | "right" | "center"
}

export function inputStyle({ align }: InputStyleProps, ...classes: ClassNameValue[]) {
	return panel(
		twMerge(
			"w-full h-10 min-w-0 rounded border border-primary-300 bg-primary-200 pl-8 pr-3 transition peer-empty:pl-3 data-[invalid=true]:border-red-500",
			align === "left" && "text-left",
			align === "right" && "text-right",
			align === "center" && "text-center",
			...classes,
		),
	)
}
