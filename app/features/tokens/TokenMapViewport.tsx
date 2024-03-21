import { useConvex, useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { type SetStateAction, useReducer, useRef, useState } from "react"
import { useDrag } from "#app/common/useDrag.js"
import { useResizeObserver } from "#app/common/useResizeObserver.js"
import { Vector } from "#app/common/vector.ts"
import { Button } from "#app/ui/Button.tsx"
import { Loading } from "#app/ui/Loading.js"
import { panel } from "#app/ui/styles.ts"
import { api } from "#convex/_generated/api.js"
import { uploadImage } from "../images/uploadImage.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { cellSize, mapSize } from "./TokenMap.tsx"
import { TokenMapGrid } from "./TokenMapGrid.tsx"

export function TokenMapViewport({
	children,
	background,
	onBackdropClick,
}: {
	children: React.ReactNode
	background?: React.ReactNode
	onBackdropClick?: () => void
}) {
	const viewportRef = useRef<HTMLDivElement>(null)

	const [viewportSize, setViewportSize] = useState(Vector.zero)
	useResizeObserver(viewportRef, (info) =>
		setViewportSize(Vector.from(info.contentRect.width, info.contentRect.height)),
	)

	const [offsetState, setOffsetState] = useReducer(
		(current: Vector, next: SetStateAction<Vector>) => {
			const offset = typeof next === "function" ? next(current) : next
			return clampOffset(offset)
		},
		Vector.zero,
	)

	function clampOffset(offset: Vector) {
		const topLeft = Vector.zero
		const bottomRight = mapSize.times(cellSize).minus(viewportSize).clampTopLeft(Vector.zero)
		return offset.clamp(topLeft, bottomRight)
	}

	const drag = useDrag(viewportRef, {
		onStart(event) {
			onBackdropClick?.()
		},
		onFinish({ distance }) {
			setOffsetState((state) => state.minus(distance))
		},
	})

	const offset = clampOffset(offsetState.minus(drag?.current.minus(drag.start) ?? Vector.zero))

	return (
		<div className="flex size-full flex-col gap-2">
			<div className="flex flex-1 gap-[inherit]">
				<Button
					text="Reset View"
					icon={<Lucide.Compass />}
					onClick={() => setOffsetState(Vector.zero)}
				/>
				<BackgroundButton />
			</div>
			<div className={panel("relative size-full select-none overflow-clip")} ref={viewportRef}>
				<div
					className="absolute top-0 left-0"
					style={{ translate: `${-offset.x}px ${-offset.y}px` }}
				>
					<div style={mapSize.times(cellSize).toObject("width", "height")} className="relative">
						{background}
					</div>
				</div>
				<TokenMapGrid offsetX={-offset.x} offsetY={-offset.y} />
				<div
					className="absolute top-0 left-0"
					style={{ translate: `${-offset.x}px ${-offset.y}px` }}
				>
					<div style={mapSize.times(cellSize).toObject("width", "height")} className="relative">
						{children}
					</div>
				</div>
			</div>
		</div>
	)
}

function BackgroundButton() {
	const room = useRoom()
	const updateRoom = useMutation(api.rooms.update)
	const backgroundImageInputRef = useRef<HTMLInputElement>(null)
	const [isUploading, setIsUploading] = useState(false)
	const convex = useConvex()

	return (
		<>
			<Button
				text="Set Background"
				icon={isUploading ? <Loading /> : <Lucide.Image />}
				onClick={() => {
					backgroundImageInputRef.current?.click()
				}}
				disabled={isUploading}
			/>
			<input
				type="file"
				accept="image/*"
				ref={backgroundImageInputRef}
				className="hidden"
				onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
					const file = event.target.files?.[0]
					if (!file) return

					setIsUploading(true)
					try {
						const imageId = await uploadImage(file, convex)
						await updateRoom({ id: room._id, mapImageId: imageId })
					} finally {
						setIsUploading(false)
					}
				}}
				disabled={isUploading}
			/>
		</>
	)
}
