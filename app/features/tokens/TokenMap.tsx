import { autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom"
import { useConvex, useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { type SetStateAction, useCallback, useEffect, useReducer, useRef, useState } from "react"
import { expect } from "#app/common/expect.ts"
import type { Nullish } from "#app/common/types.ts"
import { Vector } from "#app/common/vector.ts"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { Button } from "#app/ui/Button.tsx"
import { Loading } from "#app/ui/Loading.js"
import { panel } from "#app/ui/styles.ts"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import type { ResultQueryData } from "#convex/resultResponse.js"
import { uploadImage } from "../images/uploadImage.ts"
import { useRoom } from "../rooms/roomContext.tsx"

const mapSize = Vector.from(30)
const cellSize = 50

const leftMouseButton = 1
const rightMouseButton = 2
const middleMouseButton = 4

export function TokenMap({
	selectedCharacterId,
	onSelectedCharacterChange,
}: {
	selectedCharacterId?: Id<"characters">
	onSelectedCharacterChange?: (id: Id<"characters">) => void
}) {
	const room = useRoom()
	const characters = useQuery(api.characters.list, { roomId: room._id })

	return (
		<Viewport
			background={
				room.mapImageId && (
					<UploadedImage
						id={room.mapImageId}
						className="absolute inset-0 size-full object-contain object-left-top brightness-75"
					/>
				)
			}
		>
			{characters?.data?.map((character) => (
				<Token
					key={character._id}
					character={character}
					selected={selectedCharacterId === character._id}
					onSelect={() => {
						onSelectedCharacterChange?.(character._id)
					}}
				/>
			))}
		</Viewport>
	)
}

function Viewport({
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
				<CanvasGrid offsetX={-offset.x} offsetY={-offset.y} />
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

function Token({
	character,
	selected,
	onSelect,
}: {
	character: ResultQueryData<typeof api.characters.list>[number]
	selected: boolean
	onSelect: () => void
}) {
	const room = useRoom()

	const updateCharacter = useMutation(api.characters.update).withOptimisticUpdate((store, args) => {
		const characters = store.getQuery(api.characters.list, { roomId: room._id })
		if (!characters?.data) return
		store.setQuery(
			api.characters.list,
			{ roomId: room._id },
			{
				ok: true,
				// @ts-expect-error life is hard
				data: characters.data.map((c) =>
					c._id === args.id ? { ...c, tokenPosition: args.tokenPosition ?? c.tokenPosition } : c,
				),
			},
		)
	})

	const ref = useRef<HTMLButtonElement>(null)
	const drag = useDrag(ref, {
		onStart: () => onSelect(),
		onFinish: ({ distance }) => {
			if (selected) {
				updateCharacter({
					id: character._id,
					tokenPosition: Vector.from(character.tokenPosition)
						.plus(distance.dividedBy(cellSize))
						.clamp(Vector.zero, mapSize.minus(1)).rounded.xy,
				})
			}
		},
	})

	let visualPosition = Vector.from(character.tokenPosition).times(cellSize)
	if (drag && selected) {
		visualPosition = visualPosition.plus(drag.distance)
	}

	const { refs, floatingStyles } = useFloating({
		placement: "right",
		strategy: "fixed",
		middleware: [
			offset(8),
			shift({
				crossAxis: true,
				padding: 16,
			}),
		],
		whileElementsMounted: (...args) => autoUpdate(...args, { animationFrame: true }),
	})

	return (
		<div
			className="absolute top-0 left-0"
			style={{
				width: cellSize,
				height: cellSize,
				translate: `${visualPosition.x}px ${visualPosition.y}px`,
			}}
		>
			<div
				data-selected={selected}
				ref={refs.setReference}
				className="group relative size-full outline outline-2 outline-transparent data-[selected=true]:outline-primary-600"
			>
				<button type="button" className="size-full" ref={ref}>
					<UploadedImage
						id={character.imageId}
						emptyIcon={<Lucide.Ghost />}
						className="size-full"
						draggable={false}
					/>
				</button>

				<p className="-translate-x-1/2 pointer-events-none absolute top-full left-1/2 w-max max-w-48 translate-y-2 text-balance rounded bg-primary-100/75 p-1.5 leading-none opacity-0 empty:hidden [button:hover~&]:opacity-100 group-data-[selected=true]:opacity-100">
					{character.name}
				</p>

				<div className="-translate-x-1/2 -translate-y-2 pointer-events-none absolute bottom-full left-1/2 z-10 h-2.5 w-10 rounded border border-red-500 p-px opacity-50">
					<div
						className="h-full origin-left rounded-sm bg-red-600"
						style={{
							scale: `${1 - character.damage / (20 + character.strength)} 1`,
						}}
					/>
				</div>
			</div>
		</div>
	)
}

function CanvasGrid({
	offsetX,
	offsetY,
}: {
	offsetX: number
	offsetY: number
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const draw = useCallback(() => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		const context = expect(canvas.getContext("2d"), "failed to get canvas context")

		context.clearRect(0, 0, canvas.width, canvas.height)

		context.save()

		context.strokeStyle = "white"
		context.globalAlpha = 0.2

		context.beginPath()

		for (let x = offsetX % cellSize; x <= canvas.width; x += cellSize) {
			context.moveTo(...pixelCoords(x, 0))
			context.lineTo(...pixelCoords(x, canvas.height))
		}

		for (let y = offsetY % cellSize; y <= canvas.height; y += cellSize) {
			context.moveTo(...pixelCoords(0, y))
			context.lineTo(...pixelCoords(canvas.width, y))
		}

		context.stroke()

		context.restore()

		// context.save()
		// context.fillStyle = "white"
		// context.font = "16px sans-serif"
		// context.textBaseline = "top"
		// context.fillText(`offset: ${Math.round(offsetX)}, ${Math.round(offsetY)}`, 10, 10)
		// context.restore()
	}, [offsetX, offsetY])

	useEffect(() => {
		draw()
	}, [draw])

	useResizeObserver(canvasRef, (entry) => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		canvas.width = entry.contentRect.width
		canvas.height = entry.contentRect.height
		draw()
	})

	return <canvas ref={canvasRef} className="pointer-events-none relative size-full" />
}

function useResizeObserver(
	ref: Nullish<React.RefObject<Element> | Element>,
	callback: (entry: ResizeObserverEntry) => void,
) {
	const callbackRef = useRef<typeof callback>()
	useEffect(() => {
		callbackRef.current = callback
	})

	useEffect(() => {
		const element = ref && "current" in ref ? ref.current : ref
		if (!element) return

		const observer = new ResizeObserver((entries) => {
			callbackRef.current?.(expect(entries[0], "resize observer entry not found"))
		})
		observer.observe(element)
		return () => observer.disconnect()
	}, [ref])
}

type DragState = {
	start: Vector
	current: Vector
}

function useDrag(
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

function pixelCoords<T extends readonly number[]>(...input: readonly [...T]): readonly [...T] {
	const output = [...input] as const
	for (const [index, value] of input.entries()) {
		output[index] = Math.floor(value) + 0.5
	}
	return output
}

function useWindowEvent<K extends keyof WindowEventMap>(
	eventType: K,
	handler: (event: WindowEventMap[K]) => void,
	options?: AddEventListenerOptions,
) {
	useEffect(() => {
		window.addEventListener(eventType, handler, options)
		return () => {
			window.removeEventListener(eventType, handler, options)
		}
	})
}
