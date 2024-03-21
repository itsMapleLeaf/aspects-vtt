import { type ReactNode, isValidElement } from "react"
import { twMerge } from "tailwind-merge"

export function FormField({
	label,
	htmlFor,
	className,
	children,
}: {
	label: ReactNode
	htmlFor?: string
	className?: string
	children: React.ReactNode
}) {
	return (
		<div className={twMerge("flex flex-col", className)}>
			{isValidElement(label) ?
				label
			:	<div className="select-none text-sm/6 font-bold">
					{htmlFor ?
						<label htmlFor={htmlFor}>{label}</label>
					:	label}
				</div>
			}
			{children}
		</div>
	)
}
