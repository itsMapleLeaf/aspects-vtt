import { clamp } from "lodash-es"
import { useEffect, useRef, useState } from "react"
import { ensure } from "~/shared/errors.ts"
import { Vec } from "~/shared/vec.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { ApiScene } from "../scenes/types.ts"

/** Corresponds to the `button` property on pointer events (**not** `buttons`) */
type PointerButton = (typeof PointerButton)[keyof typeof PointerButton]
const PointerButton = {
	left: 0,
	middle: 1,
	right: 2,
} as const

export function TokenMap({ scene }: { scene: ApiScene }) {
	type State = {
		pointerButtonRight: "up" | "down" | "dragging"
		pointerStart: Vec
		pointerEnd: Vec
		viewportOffset: Vec
		viewportZoom: number
	}

	const [state, setState] = useState<State>({
		pointerButtonRight: "up",
		pointerStart: Vec.from(0),
		pointerEnd: Vec.from(0),
		viewportOffset: Vec.from(0),
		viewportZoom: 0,
	})

	const draggingOffset =
		state.pointerButtonRight === "dragging"
			? state.pointerEnd.minus(state.pointerStart)
			: Vec.from(0)

	const viewportOffset = state.viewportOffset.plus(draggingOffset)

	const viewportScaleCoefficient = 1.3
	const viewportScale = viewportScaleCoefficient ** state.viewportZoom

	const rootRef = useRef<HTMLDivElement>(null)
	const shouldPreventContextMenu = useRef(false)

	useEffect(() => {
		const root = ensure(rootRef.current)
		const controller = new AbortController()

		root.addEventListener(
			"pointerdown",
			(event) => {
				// if we somehow get another right pointer down while it's already down,
				// it should probably treat it as a pointerup followed by a pointerdown
				// but that's edge casey

				if (event.button === PointerButton.right) {
					event.preventDefault()
					setState({
						...state,
						pointerButtonRight: "down",
						pointerStart: Vec.from(event),
						pointerEnd: Vec.from(event),
					})
				}
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"pointermove",
			(event) => {
				if (
					state.pointerButtonRight === "down" ||
					state.pointerButtonRight === "dragging"
				) {
					setState({
						...state,
						pointerButtonRight: "dragging",
						pointerEnd: Vec.from(event),
					})
				}

				shouldPreventContextMenu.current = false
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"pointerup",
			(event) => {
				if (
					event.button === PointerButton.right &&
					state.pointerButtonRight === "down"
				) {
					setState({
						...state,
						pointerButtonRight: "up",
					})
					shouldPreventContextMenu.current = true
				}
				if (
					event.button === PointerButton.right &&
					state.pointerButtonRight === "dragging"
				) {
					setState({
						...state,
						pointerButtonRight: "up",
						viewportOffset: state.viewportOffset.plus(
							state.pointerEnd.minus(state.pointerStart),
						),
					})
					shouldPreventContextMenu.current = true
				}
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"blur",
			(event) => {
				if (state.pointerButtonRight === "down") {
					event.preventDefault()
					setState({
						...state,
						pointerButtonRight: "up",
					})
				}
				if (state.pointerButtonRight === "dragging") {
					event.preventDefault()
					setState({
						...state,
						pointerButtonRight: "up",
						viewportOffset: state.viewportOffset.plus(
							state.pointerEnd.minus(state.pointerStart),
						),
					})
				}
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"contextmenu",
			(event) => {
				if (shouldPreventContextMenu.current) {
					event.preventDefault()
					shouldPreventContextMenu.current = false
				}
			},
			{ signal: controller.signal },
		)

		return () => {
			controller.abort()
		}
	})

	useEffect(() => {
		const root = ensure(rootRef.current)
		const controller = new AbortController()

		root.addEventListener(
			"wheel",
			(event) => {
				if (event.deltaY === 0) return

				// the delta is actually variable; the browser can group
				// multiple scroll ticks into one go and add them all together,
				// so we need to use sensitivity logic instead,
				// e.g. saying we go 1 tick per 100 "wheel pixels"
				const delta = Math.round(event.deltaY / 100)

				setState((state) => {
					const pointerOffset = Vec.from(event).minus(state.viewportOffset)

					const nextViewportZoom = clamp(state.viewportZoom - delta, -10, 10)

					const currentViewportScale =
						viewportScaleCoefficient ** state.viewportZoom
					const nextViewportScale = viewportScaleCoefficient ** nextViewportZoom
					const scaleRatio = nextViewportScale / currentViewportScale

					return {
						...state,
						viewportOffset: state.viewportOffset.plus(
							pointerOffset.times(1 - scaleRatio),
						),
						viewportZoom: nextViewportZoom,
					}
				})
			},
			{ signal: controller.signal, passive: false },
		)

		return () => {
			controller.abort()
		}
	}, [])

	return (
		<div ref={rootRef} className="absolute inset-0 overflow-clip">
			{scene.battlemapBackgroundId && (
				<img
					src={getImageUrl(scene.battlemapBackgroundId)}
					alt=""
					className="size-auto max-w-none origin-top-left"
					style={{
						transform: [
							`translate(${viewportOffset.toCSSPixels()})`,
							`scale(${viewportScale})`,
						].join(" "),
					}}
				/>
			)}
		</div>
	)
}
