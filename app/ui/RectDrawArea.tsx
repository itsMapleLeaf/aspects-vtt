import { useGesture } from "@use-gesture/react"
import type * as React from "react"
import { twMerge } from "tailwind-merge"
import { Rect } from "../common/Rect.ts"

interface RectDrawAreaProps extends React.ComponentProps<"div"> {
	rect: Rect | undefined
	preview?: boolean
	onRectChange: (rect: Rect | undefined) => void
	onInit?: () => void
	onStart?: () => void
	onFinish?: (rect: Rect) => void
}

export function RectDrawArea({
	rect,
	preview = true,
	onRectChange,
	onInit,
	onStart,
	onFinish,
	children,
	...props
}: RectDrawAreaProps) {
	const bind = useGesture(
		{
			onPointerDown: (state) => {
				if (state.buttons === 1) {
					onRectChange(undefined)
					onInit?.()
				}
			},
			onDragStart: (state) => {
				onRectChange(Rect.from({ topLeft: state.xy, bottomRight: state.xy }))
				onStart?.()
			},
			onDrag: (state) => {
				if (rect) {
					onRectChange(rect.withEnd(state.xy))
				}
			},
			onDragEnd: (state) => {
				onRectChange(undefined)
				if (rect) onFinish?.(rect)
			},
		},
		{
			drag: {
				threshold: 8,
				eventOptions: { passive: true },
			},
		},
	)

	return (
		<div {...props} className={twMerge("relative", props.className)}>
			<div {...bind()} className="absolute inset-0 touch-none" />
			{children}
			{rect && preview && (
				<div
					className="absolute left-0 top-0 border-2 border-primary-600 bg-primary-600/25"
					style={{ translate: rect.topLeft.css.translate(), ...rect.size.toSize() }}
				/>
			)}
		</div>
	)
}
