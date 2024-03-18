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
		<div className={twMerge("flex flex-col", className)}>
			<div className="select-none font-bold text-sm/6">
				{htmlFor ? <label htmlFor={htmlFor}>{label}</label> : label}
			</div>
			{children}
		</div>
	)
}
