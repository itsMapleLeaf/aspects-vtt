import { useConvex, useMutation } from "convex/react"
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server"
import * as Lucide from "lucide-react"
import { type SetStateAction, useRef, useState } from "react"
import { z } from "zod"
import { expect } from "#app/common/expect.js"
import { clamp } from "#app/common/math.js"
import { useDrag } from "#app/common/useDrag.js"
import { useLocalStorage } from "#app/common/useLocalStorage.js"
import { useResizeObserver } from "#app/common/useResizeObserver.js"
import { Vector } from "#app/common/vector.ts"
import { Button } from "#app/ui/Button.tsx"
import { FormField } from "#app/ui/FormField.js"
import { Input } from "#app/ui/Input.js"
import { Loading } from "#app/ui/Loading.js"
import { panel } from "#app/ui/styles.ts"
import { api } from "#convex/_generated/api.js"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { uploadImage } from "../images/uploadImage.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { TokenMapGrid } from "./TokenMapGrid.tsx"
import { ViewportElementContext, ZoomContext } from "./context.tsx"

export function TokenMapViewport({
	children,
	onBackdropClick,
}: {
	children: React.ReactNode
	onBackdropClick?: () => void
}) {
	const room = useRoom()
	const [updateRoomState, updateRoom] = useMutationState(api.rooms.update)

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
		<div className="flex size-full flex-col gap-2">
			<div className="flex flex-1 flex-wrap items-end gap-[inherit]">
				<Button
					text="Reset View"
					icon={<Lucide.Compass />}
					onClick={() => setOffsetState(Vector.zero)}
				/>
				{room.isOwner && <BackgroundButton />}
				{room.isOwner && (
					<FormField label="Cell Size" htmlFor="cellSize">
						<Input
							id="cellSize"
							type="number"
							className="w-20"
							value={updateRoomState.args?.mapCellSize ?? room.mapCellSize}
							onChange={(event) => {
								const value = event.currentTarget.valueAsNumber
								if (Number.isNaN(value)) return
								updateRoom({ id: room._id, mapCellSize: Math.max(value, 1) })
							}}
						/>
					</FormField>
				)}
			</div>
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
						className="absolute left-0 top-0"
						style={mapDimensions.toObject("width", "height")}
					/>
					<ZoomContext.Provider value={zoom}>
						<TokenMapGrid
							className="absolute left-0 top-0 opacity-25"
							style={mapDimensions.toObject("width", "height")}
						/>
						<ViewportElementContext.Provider value={viewport}>
							{children}
						</ViewportElementContext.Provider>
					</ZoomContext.Provider>
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

function useMutationState<Fn extends FunctionReference<"mutation">>(query: Fn) {
	const [state, setState] = useState<
		| { status: "initial"; args?: never; data?: never; error?: never }
		| { status: "pending"; args: FunctionArgs<Fn>; data?: never; error?: never }
		| { status: "success"; args?: never; data: FunctionReturnType<Fn>; error?: never }
		| { status: "error"; args?: never; data?: never; error: unknown }
	>({ status: "initial" })

	const mutate = useMutation(query)
	const mutationToken = useRef<symbol>()

	function runMutation(args: FunctionArgs<Fn>) {
		const token = (mutationToken.current = Symbol())
		setState({ status: "pending", args })
		mutate(args)
			.then((data) => {
				if (token !== mutationToken.current) return
				setState({ status: "success", data })
			})
			.catch((error: unknown) => {
				if (token !== mutationToken.current) return
				setState({ status: "error", error })
			})
	}

	return [state, runMutation] as const
}
