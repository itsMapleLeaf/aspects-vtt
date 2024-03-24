import { expect } from "#app/common/expect.js"
import { clamp } from "#app/common/math.js"
import { useDrag } from "#app/common/useDrag.js"
import { useLocalStorage } from "#app/common/useLocalStorage.js"
import { useResizeObserver } from "#app/common/useResizeObserver.js"
import { Vector } from "#app/common/vector.ts"
import { panel } from "#app/ui/styles.ts"
import { type SetStateAction, useImperativeHandle, useState } from "react"
import { z } from "zod"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { TokenMapGrid } from "./TokenMapGrid.tsx"
import { ZoomContext } from "./context.tsx"

export type ViewportController = {
	resetView: () => void
}

export function TokenMapViewport({
	children,
	controllerRef,
	onBackdropClick,
}: {
	children: React.ReactNode
	controllerRef?: React.Ref<ViewportController>
	onBackdropClick?: () => void
}) {
	const room = useRoom()

	const [zoomFactor, setZoomFactor] = useLocalStorage("viewport:zoom", 0, z.number())
	const zoomMultiple = 1.2
	const zoom = zoomMultiple ** zoomFactor
	const extent = Vector.from(room.mapCellSize * 5 * zoom) // how much further outside the viewport the map can be

	const mapDimensions = Vector.from(room.mapDimensions)
	const [viewport, viewportRef] = useState<HTMLDivElement | null>()

	const [viewportSize, setViewportSize] = useState(Vector.zero)
	useResizeObserver(viewport, (info) =>
		setViewportSize(Vector.from(info.contentRect.width, info.contentRect.height)),
	)

	const [offsetState, setOffsetStateInternal] = useLocalStorage(
		"viewport:offset",
		Vector.zero.xy,
		z.object({ x: z.number(), y: z.number() }),
	)

	function setOffsetState(action: SetStateAction<Vector>) {
		setOffsetStateInternal((state) => {
			const newState = action instanceof Function ? action(Vector.from(state)) : action
			return clampOffset(newState).xy
		})
	}

	function clampOffset(offset: Vector) {
		const topLeft = Vector.zero
		const bottomRight = mapDimensions.times(zoom).minus(viewportSize).clampTopLeft(Vector.zero)
		return offset.clamp(topLeft.minus(extent), bottomRight.plus(extent))
	}

	useImperativeHandle(controllerRef, () => ({
		resetView() {
			setZoomFactor(0)
			setOffsetState(Vector.zero)
		},
	}))

	const drag = useDrag(viewport, {
		onStart(event) {
			onBackdropClick?.()
		},
		onFinish({ distance }) {
			setOffsetState((state) => Vector.from(state).minus(distance))
		},
	})

	const offset = clampOffset(
		Vector.from(offsetState).minus(drag?.current.minus(drag.start) ?? Vector.zero),
	)

	return (
		<div
			className={panel("relative size-full select-none overflow-clip bg-primary-200/25")}
			ref={viewportRef}
			onWheel={(event) => {
				const newZoomFactor = clamp(zoomFactor - Math.sign(event.deltaY), -10, 10)
				const newZoom = zoomMultiple ** newZoomFactor

				const viewportRect = expect(viewport, "viewport ref not set").getBoundingClientRect()
				const viewportTopLeft = Vector.from(viewportRect.left, viewportRect.top)

				const currentMouseOffset = Vector.from(event.clientX, event.clientY).minus(
					viewportTopLeft.minus(offset),
				)

				const shift = currentMouseOffset.dividedBy(zoom).times(newZoom).minus(currentMouseOffset)

				setZoomFactor(newZoomFactor)
				setOffsetState(offset.plus(shift))
			}}
		>
			<div
				data-dragging={!!drag}
				className="absolute left-0 top-0 isolate origin-top-left transition-[translate,scale] ease-out data-[dragging=true]:duration-75"
				style={{ translate: `${-offset.x}px ${-offset.y}px`, scale: zoom }}
			>
				<UploadedImage
					id={room.mapImageId}
					className="absolute left-0 top-0 brightness-75"
					style={mapDimensions.toObject("width", "height")}
				/>
				<ZoomContext.Provider value={zoom}>
					<TokenMapGrid
						className="absolute left-0 top-0 opacity-25"
						style={mapDimensions.toObject("width", "height")}
					/>
					{children}
				</ZoomContext.Provider>
			</div>
		</div>
	)
}
