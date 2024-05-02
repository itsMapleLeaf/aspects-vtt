import { useGesture, useWheel } from "@use-gesture/react"
import type { ComponentProps } from "react"
import { clamp } from "../../common/math.ts"
import { createStore } from "../../common/store.tsx"
import { Vector, type VectorInput } from "../../common/vector.ts"

export const ViewportStore = createStore({
	state: {
		offset: Vector.zero,
		scaleTick: 0,
	},
	actions: (setState) => ({
		setOffset: (offset: VectorInput) => {
			setState((state) => ({ ...state, offset: Vector.from(offset) }))
		},
		addOffset: (delta: VectorInput) => {
			setState((state) => ({ ...state, offset: state.offset.plus(delta) }))
		},
		updateZoom: (delta: number, pivotInput: VectorInput) => {
			setState((state) => {
				const newScaleTick = clamp(state.scaleTick + Math.sign(delta), -10, 10)
				const pivot = Vector.from(pivotInput).minus(state.offset)
				const shift = pivot.minus(pivot.times(getScale(newScaleTick) / getScale(state.scaleTick)))
				return {
					...state,
					scaleTick: newScaleTick,
					offset: state.offset.plus(shift),
				}
			})
		},
	}),
	context: (state) => ({
		offset: state.offset,
		scale: getScale(state.scaleTick),
	}),
})

function getScale(tick: number) {
	return 1.3 ** tick
}

export function ViewportDragInput(props: ComponentProps<"div">) {
	const actions = ViewportStore.useActions()

	const bind = useGesture(
		{
			onDrag: (state) => {
				actions.addOffset(state.delta)
			},
			onDragEnd: () => {
				// prevent a context menu from showing after we finish dragging,
				// but remove the handler after a delay in case this doesn't run for some reason
				const handleContextMenu = (event: MouseEvent): void => {
					event.preventDefault()
				}
				document.addEventListener("contextmenu", handleContextMenu, {
					once: true,
					capture: true,
				})
				setTimeout(() => {
					document.removeEventListener("contextmenu", handleContextMenu, { capture: true })
				}, 500)
			},
		},
		{
			drag: {
				pointer: {
					buttons: [2],
				},
				threshold: 8,
			},
		},
	)

	return <div {...bind()} {...props} className="absolute inset-0 touch-none" />
}

export function ViewportWheelInput({ children }: { children: React.ReactNode }) {
	const actions = ViewportStore.useActions()
	const bind = useWheel((state) => {
		// wheel events can bubble up through the _react tree_
		// through portals rendered in elements outside of this one,
		// so we have to explicitly check that the scrolled element
		// is actually inside of this in the DOM tree
		if (!(state.event.currentTarget as HTMLElement).contains(state.event.target as Node)) {
			return
		}

		actions.updateZoom(-state.delta[1], [state.event.clientX, state.event.clientY])
	}, {})
	return <div {...bind()}>{children}</div>
}
