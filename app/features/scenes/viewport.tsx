import { useGesture, useWheel } from "@use-gesture/react"
import { action, computed, observable } from "mobx"
import {
	type ComponentProps,
	type ReactNode,
	createContext,
	use,
	useState,
} from "react"
import { clamp } from "../../common/math.ts"
import { Vector, type VectorInput } from "../../common/vector.ts"

class Viewport {
	static scaleAt(tick: number) {
		return 1.3 ** tick
	}

	@observable.ref accessor offset = Vector.zero
	@observable.ref accessor scaleTick = 0

	@computed get scale() {
		return Viewport.scaleAt(this.scaleTick)
	}

	@action.bound setOffset(newOffset: VectorInput) {
		this.offset = Vector.from(newOffset)
	}

	@action.bound addOffset(delta: VectorInput) {
		this.offset = this.offset.plus(delta)
	}

	@action.bound updateZoom(delta: number, pivotInput: VectorInput) {
		const newScaleTick = clamp(this.scaleTick + Math.sign(delta), -10, 10)
		const pivot = Vector.from(pivotInput).minus(this.offset)
		const shift = pivot.minus(
			pivot.times(
				Viewport.scaleAt(newScaleTick) / Viewport.scaleAt(this.scaleTick),
			),
		)
		this.scaleTick = newScaleTick
		this.offset = this.offset.plus(shift)
	}
}

const ViewportContext = createContext(new Viewport())

export function ViewportProvider({ children }: { children: ReactNode }) {
	const [value] = useState(new Viewport())
	return <ViewportContext value={value}>{children}</ViewportContext>
}

export function useViewport() {
	return use(ViewportContext)
}

export function ViewportDragInput(props: ComponentProps<"div">) {
	const viewport = useViewport()

	const bind = useGesture(
		{
			onDrag: (state) => {
				viewport.addOffset(state.delta)
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
					document.removeEventListener("contextmenu", handleContextMenu, {
						capture: true,
					})
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

export function ViewportWheelInput({
	children,
}: {
	children: React.ReactNode
}) {
	const viewport = useViewport()
	const bind = useWheel((state) => {
		const target = state.event.currentTarget as HTMLElement | undefined
		// wheel events can bubble up through the _react tree_
		// through portals rendered in elements outside of this one,
		// so we have to explicitly check that the scrolled element
		// is actually inside of this in the DOM tree
		if (!target?.contains(state.event.target as Node)) {
			return
		}

		viewport.updateZoom(-state.delta[1], [
			state.event.clientX,
			state.event.clientY,
		])
	}, {})
	return <div {...bind()}>{children}</div>
}
