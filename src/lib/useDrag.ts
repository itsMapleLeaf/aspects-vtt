import { useEffect, useRef, useState } from "react"
import { useEventListener } from "~/lib/react.ts"
import { Rect } from "~/lib/rect.ts"
import { Vec } from "~/shared/vec.ts"

export function useDrag<StartInfo = void>(options: {
	button: "primary" | "secondary" | "aux"
	onStart?: (args: { event: PointerEvent; info: StartInfo }) => void
	onEnd?: (args: {
		start: Vec
		end: Vec
		moved: Vec
		area: Rect
		cancelled: boolean
	}) => void
}) {
	const [active, setActive] = useState(false)
	const [start, setStart] = useState(Vec.zero)
	const [end, setEnd] = useState(Vec.zero)
	const moved = end.minus(start)
	const movedActive = active ? moved : Vec.zero
	const area = Rect.bounds(start, end)
	const shouldPreventContextMenu = useRef(false)

	useEffect(() => {
		if (!active) return

		const controller = new AbortController()

		window.addEventListener(
			"pointermove",
			(event) => {
				setEnd(Vec.from(event))
				shouldPreventContextMenu.current = false
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"pointerup",
			(event) => {
				const end = Vec.from(event)
				const moved = end.minus(start)
				const area = Rect.bounds(start, end)

				setEnd(end)
				setActive(false)

				options.onEnd?.({ start, end, moved, area, cancelled: false })

				shouldPreventContextMenu.current = true
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"blur",
			() => {
				setActive(false)
				options.onEnd?.({ start, end, moved, area, cancelled: true })
				shouldPreventContextMenu.current = true
			},
			{ signal: controller.signal },
		)

		return () => {
			controller.abort()
		}
	})

	useEventListener(window, "contextmenu", (event) => {
		if (shouldPreventContextMenu.current) {
			event.preventDefault()
			shouldPreventContextMenu.current = false
		}
	})

	const handlers = (info: StartInfo) => ({
		onPointerDown: (event: React.PointerEvent) => {
			const button = (
				{
					0: "primary",
					2: "secondary",
					1: "aux",
				} as const
			)[event.button]
			if (button === options.button) {
				setStart(Vec.from(event.nativeEvent))
				setEnd(Vec.from(event.nativeEvent))
				setActive(true)
				options.onStart?.({ info, event: event.nativeEvent })
			}
		},
	})

	return { active, start, end, moved, movedActive, area, handlers }
}
