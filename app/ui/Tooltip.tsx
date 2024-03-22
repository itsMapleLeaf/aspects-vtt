import { type ComponentPropsWithoutRef, useId, useState } from "react"
import { Floating, FloatingProvider, FloatingReference } from "./Floating.tsx"

interface TooltipProps extends ComponentPropsWithoutRef<"button"> {
	text: string
}

export function Tooltip({ text, ...props }: TooltipProps) {
	const buttonId = useId()
	const tooltipId = useId()
	const [hover, setHover] = useState(false)
	const [focus, setFocus] = useState(false)

	return (
		<FloatingProvider>
			<FloatingReference>
				<button
					type="button"
					id={buttonId}
					tabIndex={0}
					aria-controls={tooltipId}
					{...props}
					onPointerEnter={(event) => {
						setHover(true)
						props.onPointerEnter?.(event)
					}}
					onPointerLeave={(event) => {
						setHover(false)
						props.onPointerLeave?.(event)
					}}
					onFocus={(event) => {
						setFocus(true)
						props.onFocus?.(event)
					}}
					onBlur={(event) => {
						setFocus(false)
						props.onBlur?.(event)
					}}
				/>
			</FloatingReference>
			<Floating>
				<div
					id={tooltipId}
					role="tooltip"
					aria-describedby={buttonId}
					aria-expanded={hover || focus}
					className="pointer-events-none w-fit max-w-32 translate-y-1 rounded bg-white px-2 py-1 text-center text-xs font-semibold text-primary-100 opacity-0 shadow-md transition aria-expanded:translate-y-0 aria-expanded:opacity-100"
				>
					{text}
				</div>
			</Floating>
		</FloatingProvider>
	)
}
