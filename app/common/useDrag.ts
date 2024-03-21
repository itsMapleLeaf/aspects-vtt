import { useEffect, useState } from "react"
import { Vector } from "#app/common/vector.ts"

type DragState = {
	start: Vector
	current: Vector
}

const leftMouseButton = 1
const rightMouseButton = 2
const middleMouseButton = 4

export function useDrag(
	ref: HTMLElement | null | undefined | { readonly current: HTMLElement | null | undefined },
	{
		onStart,
		onFinish,
	}: {
		onStart?: (event: PointerEvent) => void
		onFinish: ({ distance }: { distance: Vector }) => void
	},
) {
	const [state, setState] = useState<DragState>()

	useEffect(() => {
		const element = ref && "current" in ref ? ref.current : ref
		if (!element) return
		if (state) return

		const handleDragStart = (event: PointerEvent) => {
			if (event.buttons & leftMouseButton) {
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

		const handleDrag = (event: MouseEvent) => {
			event.preventDefault()
			setState({
				...state,
				current: Vector.from(event.clientX, event.clientY),
			})
		}

		const handleDragFinish = (event: Event) => {
			event.preventDefault()
			const distance = state.current.minus(state.start)
			onFinish({ distance })
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
