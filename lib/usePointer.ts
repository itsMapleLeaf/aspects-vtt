import { startTransition, useEffect, useRef, useState } from "react"
import { useWindowEvent } from "~/lib/react.ts"
import { Rect } from "~/lib/rect.ts"
import { Vec } from "~/lib/vec"

type ButtonName = "primary" | "secondary" | "aux"

function getButtonName(button: number): ButtonName | undefined {
	if (button === 0) return "primary"
	if (button === 1) return "aux"
	if (button === 2) return "secondary"
}

export function usePointer<StartInfo = void>({
	dragThreshold = 8,
	...options
}: {
	button: ButtonName
	dragThreshold?: number
	// always called on pointer down
	onDown?: (args: { event: PointerEvent; info: StartInfo }) => void
	// called on pointer up if the drag threshold wasn't met
	onPointerUp?: (args: {
		event?: PointerEvent
		info: StartInfo | undefined
	}) => void
	// called when the drag threshold is met
	onDragFinish?: (args: {
		start: Vec
		end: Vec
		moved: Vec
		area: Rect
		cancelled: boolean
	}) => void
}) {
	const [status, setStatus] = useState<"up" | "down" | "dragging">("up")
	const [start, setStart] = useState(Vec.zero)
	const [end, setEnd] = useState(Vec.zero)
	const [startInfo, setStartInfo] = useState<StartInfo>()
	const isDown = status === "down" || status === "dragging"
	const isDragging = status === "dragging"
	const distance = end.minus(start)
	const distanceDown = isDown ? distance : Vec.zero
	const distanceDragged = isDragging ? distance : Vec.zero
	const area = Rect.bounds(start, end)
	const shouldPreventContextMenu = useRef(false)

	const handlers = (info: StartInfo) => ({
		onPointerDown: (event: React.PointerEvent) => {
			if (getButtonName(event.button) !== options.button) return
			setStart(Vec.from(event.nativeEvent))
			setEnd(Vec.from(event.nativeEvent))
			setStatus("down")
			setStartInfo(info)
			options.onDown?.({ info, event: event.nativeEvent })
		},
	})

	useEffect(() => {
		if (!isDown) return

		const controller = new AbortController()

		window.addEventListener(
			"pointermove",
			(event) => {
				const end = Vec.from(event)
				const moved = end.minus(start)

				startTransition(() => {
					setEnd(end)
					setStatus((current) =>
						moved.length > dragThreshold ? "dragging" : current,
					)
				})
				shouldPreventContextMenu.current = false
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"pointerup",
			(event) => {
				if (getButtonName(event.button) !== options.button) return

				const end = Vec.from(event)
				const moved = end.minus(start)
				const area = Rect.bounds(start, end)

				if (isDragging) {
					options.onDragFinish?.({ start, end, moved, area, cancelled: false })
				} else {
					options.onPointerUp?.({ event, info: startInfo })
				}

				setEnd(end)
				setStatus("up")

				shouldPreventContextMenu.current = true
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"blur",
			() => {
				setStatus("up")
				if (isDragging) {
					options.onDragFinish?.({
						start,
						end,
						moved: distance,
						area,
						cancelled: true,
					})
				} else {
					options.onPointerUp?.({ info: startInfo })
				}
				shouldPreventContextMenu.current = true
			},
			{ signal: controller.signal },
		)

		return () => {
			controller.abort()
		}
	})

	useWindowEvent("contextmenu", (event) => {
		if (shouldPreventContextMenu.current) {
			event.preventDefault()
			shouldPreventContextMenu.current = false
		}
	})

	return {
		down: isDown,
		dragging: isDragging,
		start,
		end,
		distance,
		distanceDown,
		distanceDragged,
		area,
		handlers,
	}
}
