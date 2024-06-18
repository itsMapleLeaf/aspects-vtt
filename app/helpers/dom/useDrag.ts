import { useEffect, useState } from "react"
import { Vector } from "../Vector.ts"

interface DragState {
	start: Vector
	current: Vector
}

const leftMouseButton = 1
const rightMouseButton = 2
const middleMouseButton = 4

export function useDrag(
	ref: HTMLElement | null | undefined | { readonly current: HTMLElement | null | undefined },
	{
		shouldStart = () => true,
		onStart,
		onDrag,
		onFinish,
	}: {
		shouldStart?: (info: {
			event: PointerEvent
			buttons: { left: boolean; middle: boolean; right: boolean }
		}) => boolean
		onStart?: (event: PointerEvent) => void
		onDrag?: (event: PointerEvent) => void
		onFinish?: ({ distance }: { distance: Vector }) => void
	},
) {
	const [state, setState] = useState<DragState>()

	useEffect(() => {
		const element = ref && "current" in ref ? ref.current : ref
		if (!element) return
		if (state) return

		const handleDragStart = (event: PointerEvent) => {
			const info = {
				event,
				buttons: {
					left: !!(event.buttons & leftMouseButton),
					middle: !!(event.buttons & middleMouseButton),
					right: !!(event.buttons & rightMouseButton),
				},
			}
			if (shouldStart(info)) {
				event.stopPropagation()
				const position = Vector.from(event.clientX, event.clientY)
				setState({
					start: position,
					current: position,
				})
				onStart?.(event)
			}
		}

		element.addEventListener("pointerdown", handleDragStart)
		return () => {
			element.removeEventListener("pointerdown", handleDragStart)
		}
	})

	useEffect(() => {
		const element = ref && "current" in ref ? ref.current : ref
		if (!element) return
		if (!state) return

		const handleDrag = (event: PointerEvent) => {
			event.preventDefault()
			onDrag?.(event)
			setState({
				...state,
				current: Vector.from(event.clientX, event.clientY),
			})
		}

		const handleDragFinish = (event: Event) => {
			event.preventDefault()
			const distance = state.current.minus(state.start)
			onFinish?.({ distance })
			setState(undefined)
		}

		document.addEventListener("pointermove", handleDrag)
		document.addEventListener("pointerup", handleDragFinish)
		document.addEventListener("pointercancel", handleDragFinish)
		document.addEventListener("blur", handleDragFinish)

		return () => {
			document.removeEventListener("pointermove", handleDrag)
			document.removeEventListener("pointerup", handleDragFinish)
			document.removeEventListener("pointercancel", handleDragFinish)
			document.removeEventListener("blur", handleDragFinish)
		}
	})

	return state ? { ...state, distance: state?.current.minus(state.start) } : undefined
}
