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
	const [hover, setHover] = useState(false)
	const [focus, setFocus] = useState(false)
	const transition = useTransitionState(hover || focus)
	const buttonId = useId()
	const tooltipId = useId()

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
					// we don't want to keep focus after clicking
					onClick={(event) => {
						setFocus(false)
						props.onClick?.(event)
					}}
				/>
			</FloatingReference>
			{transition.mounted && (
				<Floating className="pointer-events-none">
					<div
						id={tooltipId}
						role="tooltip"
						aria-expanded={transition.enter}
						className="w-fit max-w-32 translate-y-1 rounded bg-white px-2 py-0.5 text-center text-sm font-semibold text-primary-100 opacity-0 shadow-md shadow-black/50 transition aria-expanded:translate-y-0 aria-expanded:opacity-100"
						ref={transition.ref}
					>
						{text}
					</div>
				</Floating>
			)}
		</FloatingProvider>
	)
}

function useTransitionState(visible: boolean) {
	const [transitionState, setTransitionState] = useState<
		"willEnter" | "entered" | "exiting" | "exited"
	>("exited")

	const [element, ref] = useState<HTMLElement | null>(null)

	useEffect(() => {
		switch (transitionState) {
			case "exited": {
				if (visible) setTransitionState("willEnter")
				break
			}

			case "willEnter": {
				const id = setTimeout(() => {
					setTransitionState((s) => (s === "willEnter" ? "entered" : s))
				})
				return () => clearTimeout(id)
			}

			case "entered": {
				if (!visible) setTransitionState("exiting")
				break
			}

			case "exiting": {
				if (visible) {
					setTransitionState("willEnter")
					return
				}

				if (element) {
					const handleTransitionEnd = () => {
						setTransitionState("exited")
					}
					element.addEventListener("transitionend", handleTransitionEnd)
					element.addEventListener("transitioncancel", handleTransitionEnd)
					const id = setTimeout(handleTransitionEnd, 500) // Fallback in case transitionend doesn't fire
					return () => {
						element.removeEventListener("transitionend", handleTransitionEnd)
						element.removeEventListener("transitioncancel", handleTransitionEnd)
						clearTimeout(id)
					}
				}

				break
			}
		}
	}, [element, transitionState, visible])

	return {
		mounted: transitionState !== "exited",
		enter: transitionState === "entered",
		ref,
	}
}
