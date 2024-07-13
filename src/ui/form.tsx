import { ComponentProps } from "react"
import { mergeClassProp } from "./helpers.ts"

export function Field({
	label,
	description,
	children,
	...props
}: ComponentProps<"div"> & {
	label: React.ReactNode
	description?: React.ReactNode
}) {
	return (
		<div {...mergeClassProp(props, "flex flex-col gap-1")}>
			<label htmlFor={props.id} className="text-sm font-bold leading-4">
				{label}
			</label>
			{children}
			{description && (
				<p className="text-sm leading-4 text-base-400">{description}</p>
			)}
		</div>
	)
}

export function FormError(props: ComponentProps<"p">) {
	return (
		<p {...mergeClassProp(props, "text-center font-medium text-red-400")} />
	)
}
