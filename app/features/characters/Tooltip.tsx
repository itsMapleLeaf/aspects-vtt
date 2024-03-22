import * as Floating from "@floating-ui/react-dom"
import { cloneElement, isValidElement, useId, useState } from "react"
import { createPortal } from "react-dom"

type TooltipChildrenProps = {
	ref: (node: HTMLElement | null) => void
	id: string
	tabIndex: 0
	"aria-controls": string
	onPointerEnter: (event: React.PointerEvent) => void
	onPointerLeave: (event: React.PointerEvent) => void
	onFocus: (event: React.FocusEvent) => void
	onBlur: (event: React.FocusEvent) => void
}

export function Tooltip({
	text,
	children,
}: {
	text: string
	children: React.ReactNode | ((props: TooltipChildrenProps) => React.ReactNode)
}) {
	const floating = Floating.useFloating({
		placement: "top",
		strategy: "fixed",
		middleware: [Floating.offset(8), Floating.shift({ padding: 8 })],
	})

	const referenceId = useId()
	const tooltipId = useId()
	const [hover, setHover] = useState(false)
	const [focus, setFocus] = useState(false)

	const childrenProps: TooltipChildrenProps = {
		ref: floating.refs.setReference,
		id: referenceId,
		tabIndex: 0,
		"aria-controls": tooltipId,
		onPointerEnter: () => setHover(true),
		onPointerLeave: () => setHover(false),
		onFocus: () => setFocus(true),
		onBlur: () => setFocus(false),
	}

	return (
		<>
			{isValidElement<TooltipChildrenProps>(children) ?
				cloneElement(children, childrenProps)
			: typeof children === "function" ?
				children(childrenProps)
			:	<button type="button" {...childrenProps}>
					{children}
				</button>
			}
			{createPortal(
				<div ref={floating.refs.setFloating} style={floating.floatingStyles}>
					<div
						id={tooltipId}
						role="tooltip"
						aria-describedby={referenceId}
						aria-expanded={hover || focus}
						className="pointer-events-none w-fit max-w-32 translate-y-1 rounded bg-white p-1.5 text-center text-xs font-semibold text-primary-100 opacity-0 shadow-md transition aria-expanded:translate-y-0 aria-expanded:opacity-100"
					>
						{text}
					</div>
				</div>,
				document.body,
			)}
		</>
	)
}
