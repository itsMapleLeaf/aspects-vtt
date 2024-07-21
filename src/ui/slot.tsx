import React from "react"

export interface SlotProps extends React.HTMLAttributes<Element> {
	element?: React.ReactNode
	[Key: string]: unknown
}

export function Slot({ element = <div />, children, ...props }: SlotProps) {
	return React.cloneElement(
		React.isValidElement(element) ? element : <div />,
		{
			...props,
			...(React.isValidElement<React.HTMLAttributes<Element>>(element) &&
				element.props),
		},
		children,
	)
}
