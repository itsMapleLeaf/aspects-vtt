import { ComponentProps } from "react"
import { mergeClassProp } from "./helpers.ts"

export function Field({
	label,
	inputId,
	description,
	descriptionId,
	children,
	...props
}: ComponentProps<"div"> & {
	label: React.ReactNode
	inputId?: string
	description?: React.ReactNode
	descriptionId?: string
}) {
	return (
		<div {...mergeClassProp(props, "flex flex-col gap-1")}>
			<label htmlFor={inputId} className="text-sm font-bold leading-4">
				{label}
			</label>
			{children}
			{description && (
				<p id={descriptionId} className="text-sm leading-4 text-base-400">
					{description}
				</p>
			)}
		</div>
	)
}

export function FormError(props: ComponentProps<"p">) {
	return (
		<p {...mergeClassProp(props, "text-center font-medium text-red-400")} />
	)
}
