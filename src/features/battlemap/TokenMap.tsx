import { clamp } from "lodash-es"
import { atom, computed } from "nanostores"
import { useEffect, useState } from "react"
import { Vec } from "~/shared/vec.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { ApiScene } from "../scenes/types.ts"

export function TokenMap({ scene }: { scene: ApiScene }) {
	const [controller] = useState(() => createTokenMapController())
	useEffect(() => controller.bindWindowListeners(), [controller])

	return (
		<div
			className="absolute inset-0 overflow-clip"
			ref={(element) => {
				if (element) return controller.bindRootListeners(element)
			}}
		>
			<div
				className="absolute inset-0 origin-top-left"
				ref={(element) => {
					if (!element) return
					return controller.viewportCSSTransform.subscribe((transform) => {
						element.style.transform = transform
					})
				}}
			>
				{scene.battlemapBackgroundId && (
					<img
						src={getImageUrl(scene.battlemapBackgroundId)}
						alt=""
						className="max-w-none"
					/>
				)}
			</div>
		</div>
	)
}

/** Corresponds to the `button` property on pointer events (**not** `buttons`) */
type PointerButton = (typeof PointerButton)[keyof typeof PointerButton]
const PointerButton = {
	left: 0,
	middle: 1,
	right: 2,
} as const

function createTokenMapController() {
	const pointerButtonRight = atom<"up" | "down" | "dragging">("up")
	const pointerStart = atom(Vec.from(0))
	const pointerEnd = atom(Vec.from(0))
	const viewportOffsetBase = atom(Vec.from(0))
	const viewportZoom = atom(0)
	let shouldPreventContextMenu = false

	const draggingOffset = computed(
		[pointerButtonRight, pointerStart, pointerEnd],
		(pointerButtonRight, pointerStart, pointerEnd) =>
			pointerButtonRight === "dragging"
				? pointerEnd.minus(pointerStart)
				: Vec.from(0),
	)

	const viewportOffset = computed(
		[viewportOffsetBase, draggingOffset],
		(viewportOffsetBase, draggingOffset) =>
			viewportOffsetBase.plus(draggingOffset),
	)

	const viewportScaleCoefficient = 1.3
	const viewportScale = computed(
		[viewportZoom],
		(viewportZoom) => viewportScaleCoefficient ** viewportZoom,
	)

	const viewportCSSTransform = computed(
		[viewportOffset, viewportScale],
		(offset, scale) => `translate(${offset.toCSSPixels()}) scale(${scale})`,
	)

	function bindRootListeners(element: HTMLElement) {
		const controller = new AbortController()

		element.addEventListener(
			"pointerdown",
			(event) => {
				if (event.button === PointerButton.right) {
					event.preventDefault()
					pointerButtonRight.set("down")
					pointerStart.set(Vec.from(event))
					pointerEnd.set(Vec.from(event))
				}
			},
			{ signal: controller.signal },
		)

		element.addEventListener(
			"wheel",
			(event) => {
				if (event.deltaY === 0) return

				const delta = Math.round(event.deltaY / 100) * -1

				const currentZoom = viewportZoom.get()
				const currentOffset = viewportOffset.get()

				const pointerOffset = Vec.from(event).minus(currentOffset)
				const nextViewportZoom = clamp(currentZoom + delta, -10, 10)

				const currentViewportScale = viewportScaleCoefficient ** currentZoom
				const nextViewportScale = viewportScaleCoefficient ** nextViewportZoom
				const scaleRatio = nextViewportScale / currentViewportScale

				viewportOffsetBase.set(
					viewportOffsetBase.get().plus(pointerOffset.times(1 - scaleRatio)),
				)
				viewportZoom.set(nextViewportZoom)
			},
			{ signal: controller.signal, passive: false },
		)

		return () => {
			controller.abort()
		}
	}

	function bindWindowListeners() {
		const controller = new AbortController()

		window.addEventListener(
			"pointermove",
			(event) => {
				if (
					pointerButtonRight.get() === "down" ||
					pointerButtonRight.get() === "dragging"
				) {
					pointerButtonRight.set("dragging")
					pointerEnd.set(Vec.from(event))
				}

				shouldPreventContextMenu = false
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"pointerup",
			(event) => {
				if (
					event.button === PointerButton.right &&
					pointerButtonRight.get() === "down"
				) {
					pointerButtonRight.set("up")
					shouldPreventContextMenu = true
				}
				if (
					event.button === PointerButton.right &&
					pointerButtonRight.get() === "dragging"
				) {
					pointerButtonRight.set("up")
					viewportOffsetBase.set(
						viewportOffsetBase
							.get()
							.plus(pointerEnd.get().minus(pointerStart.get())),
					)
					shouldPreventContextMenu = true
				}
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"blur",
			(event) => {
				if (pointerButtonRight.get() === "down") {
					event.preventDefault()
					pointerButtonRight.set("up")
					viewportOffsetBase.set(
						viewportOffsetBase
							.get()
							.plus(pointerEnd.get().minus(pointerStart.get())),
					)
				}
				if (pointerButtonRight.get() === "dragging") {
					event.preventDefault()
					pointerButtonRight.set("up")
					viewportOffsetBase.set(
						viewportOffsetBase
							.get()
							.plus(pointerEnd.get().minus(pointerStart.get())),
					)
				}
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"contextmenu",
			(event) => {
				if (shouldPreventContextMenu) {
					event.preventDefault()
					shouldPreventContextMenu = false
				}
			},
			{ signal: controller.signal },
		)

		return () => {
			controller.abort()
		}
	}

	return {
		bindRootListeners,
		bindWindowListeners,
		viewportCSSTransform,
	}
}
