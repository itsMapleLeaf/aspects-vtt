import type { ReactNode } from "react"

export function FormField({
	label,
	htmlFor,
	className,
	children,
}: {
	label: ReactNode
	htmlFor: string | undefined
	className?: string
	children: React.ReactNode
}) {
	return (
		<div className={className}>
			{htmlFor ?
				<label htmlFor={htmlFor} className="select-none text-sm/4 font-medium">
					{label}
				</label>
			:	<p className="select-none text-sm/4 font-medium">{label}</p>}
			{children}
		</div>
	)
}
