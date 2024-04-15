import { type ReactNode, isValidElement } from "react"
import { twMerge } from "tailwind-merge"
import { twc } from "./twc.ts"

export const FormLayout = twc.form`flex flex-col gap-3 p-3`

export const FormRow = twc.div`flex flex-wrap gap-3 *:flex-1 *:basis-36`

export const FormActions = twc.div`flex flex-wrap justify-end gap-3`

export function FormField({
	label,
	description,
	htmlFor,
	className,
	children,
}: {
	label: ReactNode
	description?: ReactNode
	htmlFor?: string
	className?: string
	children: React.ReactNode
}) {
	return (
		<div className={twMerge("flex flex-col", className)}>
			<div className="select-none font-bold leading-6">
				{isValidElement(label) ?
					label
				: htmlFor ?
					<label htmlFor={htmlFor}>{label}</label>
				:	label}
			</div>
			{description && <div className="text-sm/6 font-bold text-primary-700">{description}</div>}
			{children}
		</div>
	)
}
