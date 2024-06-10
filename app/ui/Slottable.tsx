import * as React from "react"
import { twMerge } from "tailwind-merge"

export type SlottableProps<ElementProps = React.HTMLAttributes<HTMLElement>> = ElementProps & {
	element?: React.ReactElement<Record<string, unknown>>
}

export function Slottable<ElementProps extends { className?: string }>({
	element: slot,
	fallback,
	baseClassName,
	...props
}: SlottableProps<ElementProps> & {
	fallback: React.ReactElement<Record<string, unknown>>
	baseClassName?: string
}) {
	const element = slot ?? fallback
	return React.cloneElement(element, {
		...props,
		className: twMerge(baseClassName, parseClassName(element.props.className), props.className),
	})
}

function parseClassName(input: unknown) {
	return typeof input === "string" ? input : ""
}
