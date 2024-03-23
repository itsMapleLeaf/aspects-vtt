import { type ComponentPropsWithoutRef, useEffect, useId, useState } from "react"
import {
	Floating,
	FloatingProvider,
	type FloatingProviderProps,
	FloatingReference,
} from "./Floating.tsx"

interface TooltipProps extends ComponentPropsWithoutRef<"button"> {
	text: string
	placement?: FloatingProviderProps["placement"]
}

export function Tooltip({ text, placement, ...props }: TooltipProps) {
	const buttonId = useId()
	const tooltipId = useId()
	const [hover, setHover] = useState(false)
	const [focus, setFocus] = useState(false)
	const visible = hover || focus

	const [transitionState, setTransitionState] = useState<
		"willEnter" | "entered" | "willExit" | "exited"
	>("exited")
	const enter = transitionState === "entered"
	const mounted = transitionState !== "exited"

	useEffect(() => {
		if (visible && (transitionState === "exited" || transitionState === "willExit")) {
			setTransitionState("willEnter")
		}
		if (transitionState === "willEnter") {
			setTimeout(() => {
				setTransitionState("entered")
			})
		}
		if (transitionState === "entered" && !visible) {
			setTransitionState("willExit")
		}
	}, [visible, transitionState])

	return (
		<FloatingProvider placement={placement}>
			<FloatingReference>
				<button
					type="button"
					id={buttonId}
					aria-describedby={tooltipId}
					aria-controls={tooltipId}
					tabIndex={0}
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
			{mounted && (
				<Floating className="pointer-events-none">
					<div
						id={tooltipId}
						role="tooltip"
						aria-expanded={enter}
						className="w-fit max-w-32 translate-y-1 rounded bg-white px-2 py-1 text-center text-xs font-semibold text-primary-100 opacity-0 shadow-md shadow-black/50 transition aria-expanded:translate-y-0 aria-expanded:opacity-100"
						onTransitionEnd={() => {
							if (transitionState === "willExit") {
								setTransitionState("exited")
							}
						}}
					>
						{text}
					</div>
				</Floating>
			)}
		</FloatingProvider>
	)
}
