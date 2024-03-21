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
	const room = useRoom()
	const mapDimensions = Vector.from(room.mapDimensions)
	const mapCellSize = Vector.from(room.mapCellSize)
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
		const bottomRight = mapDimensions.minus(viewportSize).clampTopLeft(Vector.zero)
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
					<div style={mapDimensions.toObject("width", "height")} className="relative">
						{background}
					</div>
				</div>
				<TokenMapGrid offsetX={-offset.x} offsetY={-offset.y} />
				<div
					className="absolute top-0 left-0"
					style={{ translate: `${-offset.x}px ${-offset.y}px` }}
				>
					<div style={mapDimensions.toObject("width", "height")} className="relative">
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
	const [pending, setPending] = useState(false)
	const convex = useConvex()

	return (
		<>
			<Button
				text="Set Background"
				icon={pending ? <Loading size="sm" className="p-0" /> : <Lucide.Image />}
				onClick={() => {
					backgroundImageInputRef.current?.click()
				}}
				disabled={pending}
			/>
			<input
				type="file"
				accept="image/png,image/jpeg,image/gif,image/webp"
				ref={backgroundImageInputRef}
				className="hidden"
				onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
					const file = event.target.files?.[0]
					if (!file) return

					setPending(true)
					try {
						const mapDimensions = await new Promise<{ width: number; height: number }>(
							(resolve, reject) => {
								const image = new Image()
								image.src = URL.createObjectURL(file)
								image.onload = () => {
									resolve({ width: image.width, height: image.height })
								}
								image.onerror = () =>
									reject(new Error(`Failed to get dimensions from image "${file.name}"`))
							},
						)

						const mapImageId = await uploadImage(file, convex)

						await updateRoom({
							id: room._id,
							mapImageId,
							mapDimensions,
						})
					} catch (error) {
						console.error(error)
						alert("Failed to upload image")
					} finally {
						setPending(false)
					}
				}}
				disabled={pending}
			/>
		</>
	)
}
