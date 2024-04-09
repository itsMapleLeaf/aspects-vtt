import { type SetStateAction, useEffect, useImperativeHandle, useRef, useState } from "react"
import { z } from "zod"
import { expect } from "#app/common/expect.js"
import { clamp } from "#app/common/math.js"
import { useDrag } from "#app/common/useDrag.js"
import { useLocalStorageState } from "#app/common/useLocalStorage.js"
import { useResizeObserver } from "#app/common/useResizeObserver.js"
import { Vector } from "#app/common/vector.ts"
import { panel } from "#app/ui/styles.ts"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { TokenMapGrid } from "./TokenMapGrid.tsx"
import { OffsetContext, ZoomContext } from "./context.tsx"

export type ViewportController = {
	resetView: () => void
}

const zoomMultiple = 1.2

export function TokenMapViewport({
	children,
	controllerRef,
	offsetDraggingDisabled,
	onBackdropClick,
}: {
	children: React.ReactNode
	controllerRef?: React.Ref<ViewportController>
	offsetDraggingDisabled?: boolean
	onBackdropClick?: () => void
}) {
	const room = useRoom()

	const [zoomLevel, setZoomLevel] = useLocalStorageState("viewport:zoom", 0, z.number())
	const zoom = zoomMultiple ** zoomLevel

	const mapDimensions = Vector.from(room.mapDimensions)
	const [containerElement, containerRef] = useState<HTMLDivElement | null>()

	const [containerSize, setContainerSize] = useState(Vector.zero)
	useResizeObserver(containerElement, (info) => setContainerSize(Vector.fromSize(info.contentRect)))

	const [offsetState, setOffsetState] = useLocalStorageState(
		"viewport:offset",
		{ x: 0, y: 0 },
		z.object({ x: z.number(), y: z.number() }),
	)

	function setOffset(action: SetStateAction<{ x: number; y: number }>) {
		const newState = action instanceof Function ? action(offsetState) : action
		const zoomedMapDimensions = mapDimensions.times(zoom)
		setOffsetState(
			Vector.from(newState).clamp(
				containerSize.dividedBy(2).minus(zoomedMapDimensions),
				containerSize.dividedBy(2),
			).xy,
		)
	}

	useImperativeHandle(controllerRef, () => ({
		resetView() {
			setZoomLevel(0)
			setOffset(Vector.zero)
		},
	}))

	const drag = useDrag(containerElement, {
		onStart(event) {
			if (offsetDraggingDisabled) return
			onBackdropClick?.()
		},
		onFinish({ distance }) {
			if (offsetDraggingDisabled) return
			setOffset((state) => Vector.from(state).plus(distance))
		},
	})

	let translation = Vector.from(offsetState)
	if (drag?.distance && !offsetDraggingDisabled) {
		translation = translation.plus(drag.distance)
	}

	// const transformRef = useRef<HTMLDivElement | null>(null)
	// {
	// 	const currentTranslationRef = useRef(translation)
	// 	const currentZoomRef = useRef(zoom)
	// 	useAnimationCallback((delta) => {
	// 		const stiffness = 30

	// 		currentTranslationRef.current = currentTranslationRef.current.lerp(
	// 			translation,
	// 			1 - 0.5 ** (delta * stiffness),
	// 		)
	// 		currentZoomRef.current = lerp(currentZoomRef.current, zoom, 1 - 0.5 ** (delta * stiffness))

	// 		const element = expect(transformRef.current, "transform ref not set")
	// 		element.style.translate = `${currentTranslationRef.current.x}px ${currentTranslationRef.current.y}px`
	// 		element.style.scale = String(currentZoomRef.current)
	// 	})
	// }

	return (
		<div
			className={panel("relative size-full select-none overflow-clip bg-primary-200/25")}
			ref={containerRef}
			onWheel={(event) => {
				const newZoomLevel = clamp(zoomLevel - Math.sign(event.deltaY), -10, 10)
				const newZoom = zoomMultiple ** newZoomLevel

				const viewportRect = expect(
					containerElement,
					"viewport ref not set",
				).getBoundingClientRect()
				const viewportTopLeft = Vector.from(viewportRect.left, viewportRect.top)

				const currentMouseOffset = Vector.from(event.clientX, event.clientY).minus(
					viewportTopLeft.plus(translation),
				)

				const shift = currentMouseOffset.times(newZoom / zoom).minus(currentMouseOffset)

				setZoomLevel(newZoomLevel)
				setOffset(translation.minus(shift))
			}}
		>
			<UploadedImage
				id={room.mapImageId}
				className="absolute left-0 top-0 brightness-75 transition-[transform,width,height] ease-out"
				style={{
					width: mapDimensions.x,
					height: mapDimensions.y,
					transform: `translate(${translation.x}px, ${translation.y}px) scale(${zoom})`,
					transformOrigin: "left top",
				}}
			/>
			<ZoomContext.Provider value={zoom}>
				<OffsetContext.Provider value={translation}>
					<TokenMapGrid
						className="absolute left-0 top-0 opacity-25 transition-[transform,width,height] ease-out"
						style={{
							width: mapDimensions.x,
							height: mapDimensions.y,
							transform: `translate(${translation.x}px, ${translation.y}px) scale(${zoom})`,
							transformOrigin: "left top",
						}}
					/>
					{children}
				</OffsetContext.Provider>
			</ZoomContext.Provider>
		</div>
	)
}

function useAnimationCallback(callback: (deltaTime: number) => void) {
	const callbackRef = useRef(callback)
	useEffect(() => {
		callbackRef.current = callback
	})

	useEffect(() => {
		let running = true
		void (async () => {
			let time = await waitForAnimationFrame()
			while (running) {
				const currentTime = await waitForAnimationFrame()
				const deltaTime = (currentTime - time) / 1000
				time = currentTime
				callbackRef.current(deltaTime)
			}
		})()
		return () => {
			running = false
		}
	}, [])
}

const waitForAnimationFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve))

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t
}
