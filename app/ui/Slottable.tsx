import * as React from "react"
import { twMerge } from "tailwind-merge"

export type SlottableProps<
	ElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>,
> = ElementProps & {
	element?: React.ReactElement<
		React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
	>
}

export function Slottable<ElementProps extends { className?: string }>({
	element: slot,
	fallback,
	baseClassName,
	...props
}: SlottableProps<ElementProps> & {
	fallback: React.ReactElement<
		React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
	>
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
