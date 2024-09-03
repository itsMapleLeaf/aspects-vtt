import { ComponentProps, startTransition } from "react"

export type PressEvent = React.PointerEvent | React.KeyboardEvent

export type PressHandler = (event: PressEvent) => void

export interface PressableProps extends ComponentProps<"div"> {
	onPress?: PressHandler
}

export function Pressable({ onPress, ...props }: PressableProps) {
	return (
		<div
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
