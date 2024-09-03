import { ComponentProps, startTransition } from "react"

export type PressEvent = React.PointerEvent | React.KeyboardEvent

export type PressHandler = (event: PressEvent) => void

export interface PressableProps extends ComponentProps<"div"> {
	onPress?: PressHandler
}

/**
 * Represents an element that can be pressed via mouse or keyboard.
 *
 * For more immediate feedback, this component reacts on **press** instead of on
 * release.
 *
 * For ease of styling, it renders a div, but with `role="button"` and
 * `tabIndex={0}` for accessibility.
 */
export function Pressable({ onPress, ...props }: PressableProps) {
	return (
		<div
			role="button"
			tabIndex={0}
			{...props}
			onPointerDown={(event) => {
				event.preventDefault()
				startTransition(() => {
					props.onPointerDown?.(event)
					onPress?.(event)
				})
			}}
			onKeyDown={(event) => {
				event.preventDefault()
				startTransition(() => {
					props.onKeyDown?.(event)
					if (event.key === "Enter" || event.key === " ") {
						onPress?.(event)
					}
				})
			}}
		></div>
	)
}
