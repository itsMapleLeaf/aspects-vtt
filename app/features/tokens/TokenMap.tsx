import { autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { expect } from "#app/common/expect.ts"
import type { Nullish } from "#app/common/types.ts"
import { Vector } from "#app/common/vector.ts"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { Button } from "#app/ui/Button.tsx"
import { panel } from "#app/ui/styles.ts"
import { api } from "#convex/_generated/api.js"
import type { Doc, Id } from "#convex/_generated/dataModel.js"
import { TOKEN_FIELDS, TokenField } from "./tokenFields.tsx"

const cellSize = 80
const leftMouseButton = 1
const rightMouseButton = 2
const middleMouseButton = 4

export function TokenMap({ roomSlug }: { roomSlug: string }) {
	const tokens = useQuery(api.mapTokens.list, { roomSlug }) ?? []
	const [selectedTokenId, setSelectedTokenId] = useState<Id<"mapTokens">>()
	return (
		<Viewport roomSlug={roomSlug} onBackdropClick={() => setSelectedTokenId(undefined)}>
			{tokens.map((token) => (
				<Token
					key={token._id}
					token={token}
					selected={selectedTokenId === token._id}
					onSelect={() => {
						setSelectedTokenId(token._id)
					}}
				/>
			))}
		</Viewport>
	)
}

function Viewport({
	children,
	roomSlug,
	onBackdropClick,
}: {
	children: React.ReactNode
	roomSlug: string
	onBackdropClick?: () => void
}) {
	const [drag, dragRef] = useDrag({
		onStart(event) {
			if (event.target === event.currentTarget) onBackdropClick?.()
		},
		onFinish({ distance }) {
			setOffsetState((state) => state.plus(distance))
		},
	})

	const [offsetState, setOffsetState] = useState(Vector.from(0, 0))
	const offset = offsetState.plus(drag?.current.minus(drag.start) ?? Vector.from(0, 0))

	return (
		<div className="flex h-full flex-col gap-2">
			<div className="flex flex-1 gap-[inherit]">
				<Button
					text="Reset View"
					icon={<Lucide.Compass />}
					onClick={() => setOffsetState(Vector.from(0, 0))}
				/>
				<AddTokenButton roomSlug={roomSlug} />
			</div>
			<div className={panel("relative size-full overflow-clip")} ref={dragRef}>
				<CanvasGrid offsetX={offset.x} offsetY={offset.y} />
				<div className="absolute top-0 left-0" style={{ translate: `${offset.x}px ${offset.y}px` }}>
					{children}
				</div>
			</div>
		</div>
	)
}

function Token({
	token,
	selected,
	onSelect,
}: { token: Doc<"mapTokens">; selected: boolean; onSelect: () => void }) {
	const removeToken = useMutation(api.mapTokens.remove)

	const updateToken = useMutation(api.mapTokens.update).withOptimisticUpdate((store, args) => {
		const tokens = store.getQuery(api.mapTokens.list, { roomSlug: token.roomSlug })
		if (!tokens) return
		store.setQuery(
			api.mapTokens.list,
			{ roomSlug: token.roomSlug },
			tokens.map((token) =>
				token._id === args.id
					? { ...token, ...args, x: args.x ?? token.x, y: args.y ?? token.y }
					: token,
			),
		)
	})

	const [drag, dragRef] = useDrag({
		onStart: () => onSelect(),
		onFinish: ({ distance }) => {
			updateToken({
				id: token._id,
				...Vector.from(token).plus(distance.dividedBy(cellSize)).rounded.xy,
			})
		},
	})

	let visualPosition = Vector.from(token).times(cellSize)
	if (drag) {
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

	const values = new Map(token.fields?.map((field) => [field.key, field.value]))

	let barFieldDisplay
	for (const field of TOKEN_FIELDS) {
		if (field.display?.type === "bar") {
			barFieldDisplay = field.display
			break
		}
	}

	let tagFieldDisplay
	for (const field of TOKEN_FIELDS) {
		if (field.display?.type === "tag") {
			tagFieldDisplay = field.display
			break
		}
	}

	return (
		<div
			key={token._id}
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
				<button type="button" className="size-full" ref={dragRef}>
					{token.imageId ? (
						<UploadedImage imageId={token.imageId} className="size-full" />
					) : (
						<Lucide.Ghost className="size-full" />
					)}
					{tagFieldDisplay && (
						<p className="-translate-x-1/2 absolute top-full left-1/2 w-max max-w-48 translate-y-2 text-balance rounded bg-primary-100/75 p-1.5 leading-none empty:hidden">
							{tagFieldDisplay.getText(values)}
						</p>
					)}
				</button>

				{barFieldDisplay && (
					<div className="-translate-x-1/2 -translate-y-2 absolute bottom-full left-1/2 z-10 h-3 w-16 rounded border border-red-500 p-px opacity-50">
						<div
							className="h-full origin-left rounded-sm bg-red-600"
							style={{ scale: barFieldDisplay.getValue(values) / barFieldDisplay.getMax(values) }}
						/>
					</div>
				)}

				{selected &&
					createPortal(
						<div
							ref={refs.setFloating}
							style={floatingStyles}
							className={panel("flex w-64 flex-col gap-3 p-2 shadow-md")}
						>
							{TOKEN_FIELDS.map((field) => (
								<TokenField {...field} token={token} key={field.label} />
							))}
							<Button
								icon={<Lucide.Trash />}
								text="Delete"
								className="self-start"
								onClick={() => removeToken({ id: token._id })}
							/>
						</div>,
						document.body,
					)}
			</div>
		</div>
	)
}

function AddTokenButton({ roomSlug }: { roomSlug: string }) {
	const createToken = useMutation(api.mapTokens.create)
	return (
		<Button
			text="Add Token"
			icon={<Lucide.ImagePlus />}
			onClick={() =>
				createToken({
					roomSlug,
					x: 0,
					y: 0,
					fields: TOKEN_FIELDS.map((field) => ({
						key: field.label.toLowerCase(),
						value: field.fallback(),
					})),
				})
			}
		/>
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
		context.globalAlpha = 0.25

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

		context.save()
		context.fillStyle = "white"
		context.font = "16px sans-serif"
		context.textBaseline = "top"
		context.fillText(`offset: ${-offsetX}, ${-offsetY}`, 10, 10)
		context.restore()
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

	return <canvas ref={canvasRef} className="pointer-events-none size-full" />
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

function useDrag({
	onStart,
	onFinish,
}: {
	onStart?: (event: PointerEvent) => void
	onFinish: ({ distance }: { distance: Vector }) => void
}) {
	const [state, setState] = useState<DragState>()
	const [element, dragRef] = useState<HTMLElement | null>()

	useEffect(() => {
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

	return [
		state ? { ...state, distance: state?.current.minus(state.start) } : undefined,
		dragRef,
	] as const
}

function pixelCoords<T extends readonly number[]>(...input: readonly [...T]): readonly [...T] {
	const output = [...input] as const
	for (const [index, value] of input.entries()) {
		output[index] = Math.floor(value) + 0.5
	}
	return output
}
