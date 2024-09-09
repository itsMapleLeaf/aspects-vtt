import { ComponentProps, startTransition, useRef } from "react"

export interface PressableProps extends ComponentProps<"div"> {
	onPress?: PressHandler
	onDoublePress?: PressHandler
}

export type PressHandler = (event: PressEvent) => void

export interface PressEvent {
	type: "pointer" | "keyboard" | (string & {})
	ctrlKey: boolean
	shiftKey: boolean
	altKey: boolean
	metaKey: boolean
}

const DOUBLE_PRESS_DELAY = 350

/**
 * Represents an element that can be pressed via mouse or keyboard.
 *
 * For more immediate feedback, this component reacts on **press** instead of on
 * release.
 *
 * For ease of styling, it renders a div, but with `role="button"` and
 * `tabIndex={0}` for accessibility.
 */
export function Pressable({
	onPress,
	onDoublePress,
	...props
}: PressableProps) {
	const lastPressTime = useRef(0)

	const handlePress = (event: PressEvent) => {
		if (Date.now() - lastPressTime.current < DOUBLE_PRESS_DELAY) {
			onDoublePress?.(event)
		} else {
			onPress?.(event)
		}
		lastPressTime.current = Date.now()
	}

	return (
		<div
			role="button"
			tabIndex={0}
			{...props}
			onPointerDown={(event) => {
				event.preventDefault()
				startTransition(() => {
					props.onPointerDown?.(event)
					handlePress(event)
				})
			}}
			onKeyDown={(event) => {
				event.preventDefault()
				startTransition(() => {
					props.onKeyDown?.(event)
					if (event.key === "Enter" || event.key === " ") {
						handlePress(event)
					}
				})
			}}
		></div>
	)
}
