import type { ReactNode } from "react"
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
		<div className={twMerge(className, "flex flex-col gap-1")}>
			{htmlFor ?
				<label htmlFor={htmlFor} className="select-none text-sm/4 font-medium">
					{label}
				</label>
			:	<p className="select-none text-sm/4 font-medium">{label}</p>}
			{children}
		</div>
	)
}
