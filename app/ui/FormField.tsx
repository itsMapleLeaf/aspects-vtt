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
				<label htmlFor={htmlFor} className="select-none font-medium text-sm/4">
					{label}
				</label>
			:	<p className="select-none font-medium text-sm/4">{label}</p>}
			{children}
		</div>
	)
}
