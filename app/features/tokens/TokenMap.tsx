import { useMutation, useQuery } from "convex/react"
import type { FunctionArgs } from "convex/server"
import * as Lucide from "lucide-react"
import { type Ref, use, useRef, useState } from "react"
import { useMutationState } from "#app/common/convex.js"
import { useAsyncState } from "#app/common/useAsyncState.js"
import { useDrag } from "#app/common/useDrag.js"
import { useWindowEvent } from "#app/common/useWindowEvent.js"
import { Vector } from "#app/common/vector.js"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { useRoom } from "#app/features/rooms/roomContext.js"
import { TokenElement } from "#app/features/tokens/TokenElement.tsx"
import {
	TokenMapViewport,
	type ViewportController,
} from "#app/features/tokens/TokenMapViewport.tsx"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import { selectCharacterEvent } from "../characters/CharactersPanel.tsx"
import { OffsetContext, ZoomContext } from "./context.tsx"

export function TokenMap({
	viewportRef,
	drawingArea,
	onFinishDrawingArea,
}: {
	viewportRef: Ref<ViewportController>
	drawingArea: boolean
	onFinishDrawingArea: () => void
}) {
	const room = useRoom()
	const zoom = use(ZoomContext)

	const characters = useQuery(api.characters.list, { roomId: room._id })
	const updateCharacter = useMutation(api.characters.update)

	const [createRectangleState, createRectangle] = useAsyncState(useMutation(api.rectangles.create))
	const [updateRectangleState, updateRectangle] = useMutationState(api.rectangles.update)
	const [removeRectangleState, removeRectangle] = useMutationState(api.rectangles.remove)

	const rectangles = useQuery(api.rectangles.list, { roomId: room._id })
		// optimistic remove
		?.filter((it) => it._id !== removeRectangleState.args?.id)
		// optimistic update
		.map((it) =>
			it._id === updateRectangleState.args?.id ? { ...it, ...updateRectangleState.args } : it,
		)
		// optimistic create
		.concat(
			createRectangleState.args ?
				[
					{
						...createRectangleState.args,
						_id: "new" as Id<"rectangles">,
						_creationTime: Date.now(),
					},
				]
			:	[],
		)

	const [selected, setSelected] = useState<Id<"characters"> | Id<"rectangles">>()

	useWindowEvent("keydown", (event) => {
		// don't do anything if an input is focused
		if (document.activeElement instanceof HTMLInputElement) return
		if (document.activeElement instanceof HTMLTextAreaElement) return

		if (selected && event.key === "Delete") {
			const rectangle = rectangles?.find((r) => r._id === selected)
			if (rectangle) {
				removeRectangle({ id: rectangle._id })
				setSelected(undefined)
			}
		}
	})

	return (
		<TokenMapViewport
			controllerRef={viewportRef}
			offsetDraggingDisabled={drawingArea}
			onBackdropClick={() => setSelected(undefined)}
		>
			{rectangles?.map((rectangle) => (
				<TokenElement
					key={rectangle._id}
					token={rectangle.token}
					size={Vector.fromSize(rectangle.size).times(room.mapCellSize * zoom)}
					onPointerDown={() => setSelected(rectangle._id)}
					onMove={(position) =>
						updateRectangle({
							id: rectangle._id,
							token: { ...rectangle.token, position: position.xy },
						})
					}
				>
					{selected === rectangle._id && <TokenSelectionOutline />}
					<div className="absolute inset-0 rounded border-[3px] border-blue-400 bg-blue-400/10" />
				</TokenElement>
			))}

			{characters?.map((character) => (
				<TokenElement
					key={character._id}
					token={character.token}
					size={Vector.from(room.mapCellSize * zoom)}
					onPointerDown={() => {
						setSelected(character._id)
						selectCharacterEvent.emit(character._id)
					}}
					onMove={(position) =>
						updateCharacter({
							id: character._id,
							token: { ...character.token, position: position.xy },
						})
					}
					attachments={
						<p
							data-selected={selected === character._id}
							className="absolute left-1/2 top-full z-10 w-max -translate-x-1/2 translate-y-2 whitespace-nowrap rounded bg-black/75 px-2 py-1.5 text-center font-medium leading-tight text-white opacity-0 transition data-[selected=true]:opacity-100 [div:has(button:hover)~div>&]:opacity-100"
						>
							{character.nameVisible ?
								<>
									{character.displayName}
									<br />({character.displayPronouns})
								</>
							:	"???"}
						</p>
					}
				>
					{selected === character._id && <TokenSelectionOutline />}
					<UploadedImage
						id={character.imageId}
						emptyIcon={<Lucide.Ghost />}
						data-hidden={!character.token.visible}
						className="relative size-full transition-opacity data-[hidden=true]:opacity-50"
					/>
				</TokenElement>
			))}

			{drawingArea && (
				<AreaPlacement
					createRectangle={async function onFinish(args) {
						onFinishDrawingArea()
						try {
							await createRectangle(args)
						} catch (error) {
							alert("Something went wrong, try again.")
							console.error(error)
						}
					}}
				/>
			)}
		</TokenMapViewport>
	)
}

function TokenSelectionOutline() {
	return (
		<div className="absolute inset-0 rounded bg-primary-600/25 outline outline-[3px] outline-primary-700" />
	)
}

function AreaPlacement({
	createRectangle,
}: {
	createRectangle: (args: FunctionArgs<typeof api.rectangles.create>) => void
}) {
	const room = useRoom()
	const zoom = use(ZoomContext)
	const offset = use(OffsetContext)

	const [cursorStart, setCursorStart] = useState(Vector.zero)

	const containerRef = useRef<HTMLDivElement>(null)

	const drag = useDrag(containerRef, {
		async onFinish() {
			createRectangle({
				roomId: room._id,
				size: bottomRight.minus(topLeft).plus(1).abs.toObject("width", "height"),
				token: {
					position: topLeft.xy,
					visible: true,
				},
			})
		},
	})

	const cursorEnd = cursorStart.plus(drag?.distance ?? Vector.zero)

	const topLeft = Vector.topLeftMost(cursorStart, cursorEnd)
		.minus(offset)
		.dividedBy(zoom * room.mapCellSize).floor

	const bottomRight = Vector.bottomRightMost(cursorStart, cursorEnd)
		.minus(offset)
		.dividedBy(zoom * room.mapCellSize).floor

	const translation = topLeft.times(zoom * room.mapCellSize).plus(offset)

	const dimensions = bottomRight
		.minus(topLeft)
		.plus(1)
		.times(zoom * room.mapCellSize)

	return (
		<div
			ref={containerRef}
			className="absolute inset-0"
			onPointerMove={(event) => {
				if (drag) return
				setCursorStart(Vector.from(event.clientX, event.clientY))
			}}
		>
			<div
				className="pointer-events-none absolute inset-0 rounded outline outline-[3px] outline-primary-700"
				style={{
					transform: `translate(${translation.x}px, ${translation.y}px)`,
					width: dimensions.x,
					height: dimensions.y,
				}}
			/>
		</div>
	)
}
