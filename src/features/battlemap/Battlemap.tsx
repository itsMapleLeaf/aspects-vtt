import { useMutation } from "convex/react"
import Konva from "konva"
import { clamp, merge } from "lodash-es"
import { ReactNode, useRef, useState } from "react"
import { Group, Image, Layer, Rect, Stage, StageProps } from "react-konva"
import type { SetRequired } from "type-fest"
import * as v from "valibot"
import { useImage, useLocalStorage, useWindowSize } from "~/common/react/dom.ts"
import { api } from "~/convex/_generated/api.js"
import { List } from "~/shared/list.ts"
import { Region } from "~/shared/region.ts"
import { Vec } from "~/shared/vec.ts"
import { CharacterBattlemapToken } from "../characters/CharacterBattlemapToken.tsx"
import {
	CharacterMenu,
	useCharacterMenuController,
} from "../characters/CharacterMenu.tsx"
import type { ApiCharacter } from "../characters/types.ts"
import { useRoomContext } from "../rooms/context.tsx"
import type { ApiScene } from "../scenes/types.ts"

export function Battlemap({
	scene,
	characters,
	backgroundUrl,
}: {
	scene: ApiScene
	characters: ApiCharacter[]
	backgroundUrl: string
}) {
	const [selecting, setSelecting] = useState(false)
	const [selectedIds, setSelectedIds] = useState(new Set<string>())

	const tokens = characters
		.flatMap((c) => (c.token ? [{ ...c, token: c.token }] : []))
		.toSorted((a, b) => a.token.updatedAt - b.token.updatedAt)

	const selected = tokens.filter((it) => selectedIds.has(it.public._id))
	const deselected = tokens.filter((it) => !selectedIds.has(it.public._id))

	const tokenShapesRef = useRef(new Map<string, Konva.Shape>())

	const registerShape = (id: string, shape: Konva.Shape) => {
		tokenShapesRef.current.set(id, shape)
		return () => {
			tokenShapesRef.current.delete(id)
		}
	}

	const characterMenuController = useCharacterMenuController()

	return (
		<>
			<BattlemapStage
				onSelectRegionStart={() => {
					setSelecting(true)
				}}
				onSelectRegion={(region) => {
					setSelecting(false)
					const matching = List.of(...tokenShapesRef.current)
						.select(([, shape]) =>
							Region.from(region).intersects(
								new Region(
									Vec.from(shape.position()),
									Vec.from({
										x: shape.width(),
										y: shape.height(),
									}),
								),
							),
						)
						.map(([id]) => id)
					setSelectedIds(new Set(matching))
				}}
			>
				<BattlemapBackground backgroundUrl={backgroundUrl} />

				{deselected.map((character) => (
					<DraggableTokenGroup
						key={character.public._id}
						characters={[character]}
						scene={scene}
					>
						<CharacterBattlemapToken
							key={character.public._id}
							character={character}
							scene={scene}
							token={character.token}
							shapeRef={(shape) => {
								if (!shape) return
								registerShape(character.public._id, shape)
							}}
							selected={false}
							tooltipsDisabled={characterMenuController.open || selecting}
							onContextMenu={(event) =>
								characterMenuController.show(event.evt, [character])
							}
						/>
					</DraggableTokenGroup>
				))}

				<DraggableTokenGroup characters={selected} scene={scene}>
					{selected.map((character) => (
						<CharacterBattlemapToken
							key={character.public._id}
							character={character}
							scene={scene}
							token={character.token}
							selected
							tooltipsDisabled={characterMenuController.open || selecting}
							onContextMenu={(event) =>
								characterMenuController.show(event.evt, selected)
							}
							shapeRef={(shape) => {
								if (!shape) return
								registerShape(character.public._id, shape)
							}}
						/>
					))}
				</DraggableTokenGroup>
			</BattlemapStage>

			<CharacterMenu controller={characterMenuController} />
		</>
	)
}

function DraggableTokenGroup({
	characters,
	scene,
	children,
}: {
	characters: SetRequired<ApiCharacter, "token">[]
	scene: ApiScene
	children: ReactNode
}) {
	const roomId = useRoomContext()._id
	const [dragStart, setDragStart] = useState<Vec>()

	const updateCharacter = useMutation(
		api.characters.update,
	).withOptimisticUpdate((store, args) => {
		const characters = store.getQuery(api.characters.list, { roomId })
		const charactersById = new Map(characters?.map((it) => [it.public._id, it]))
		for (const { characterId, ...updates } of args.updates ?? []) {
			const char = charactersById.get(characterId)
			if (char) {
				charactersById.set(
					characterId,
					merge({}, char, {
						full: updates,
						token: updates,
					}),
				)
			}
		}
		store.setQuery(api.characters.list, { roomId }, [
			...charactersById.values(),
		])
	})

	return (
		<Group
			draggable
			x={0}
			y={0}
			onPointerDown={(event) => {
				if (event.evt.button === 0) {
					event.cancelBubble = true
				}
			}}
			onDragStart={(event) => {
				setDragStart(Vec.from(event.currentTarget.position()))

				// update updatedAt so the characters appear on top of others
				updateCharacter({
					updates: characters.map((it) => ({
						characterId: it.public._id,
						updatedAt: Date.now(),
					})),
				}).catch(console.error)
			}}
			onDragEnd={async (event) => {
				event.cancelBubble = true

				if (!dragStart) return

				const dragEnd = Vec.from(event.currentTarget.position())
				const difference = dragEnd.subtract(dragStart)

				setDragStart(undefined)

				updateCharacter({
					updates: characters.map((it) => ({
						characterId: it.public._id,
						battlemapPosition: Vec.from(it.token.battlemapPosition)
							.add(difference)
							.roundTo(scene.cellSize / 4)
							.toJSON(),
						updatedAt: Date.now(),
					})),
				}).catch(console.error)

				// makes the position update happen at the same time as the optimistic state update,
				// which (usually) avoids a flicker in offset positioning
				requestAnimationFrame(() => {
					event.currentTarget.position({ x: 0, y: 0 })
				})
			}}
		>
			{children}
		</Group>
	)
}

function BattlemapStage({
	children,
	onSelectRegionStart,
	onSelectRegion,
	...props
}: StageProps & {
	children: ReactNode
	onSelectRegionStart: () => void
	onSelectRegion: (region: {
		x: number
		y: number
		width: number
		height: number
	}) => void
}) {
	const [windowWidth, windowHeight] = useWindowSize()

	const [translate, setTranslate] = useLocalStorage(
		"viewportTranslate",
		{ x: 0, y: 0 },
		v.parser(v.object({ x: v.number(), y: v.number() })),
	)

	const [zoomTick, setZoomTick] = useLocalStorage(
		"viewportZoomTick",
		0,
		v.parser(v.number()),
	)

	const [selectionStart, setSelectionStart] = useState<Vec>()
	const [selectionEnd, setSelectionEnd] = useState<Vec>()

	let selectionArea
	if (selectionStart && selectionEnd) {
		const topLeft = selectionStart.zip(selectionEnd, Math.min)
		const bottomRight = selectionStart.zip(selectionEnd, Math.max)
		selectionArea = {
			x: topLeft.x,
			y: topLeft.y,
			width: bottomRight.x - topLeft.x,
			height: bottomRight.y - topLeft.y,
		}
	}

	const getZoom = (zoomTick: number) => 1.2 ** normalizeZoomTick(zoomTick)

	const normalizeZoomTick = (zoomTick: number) =>
		clamp(Math.round(zoomTick), -10, 10)

	const handleWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
		props.onWheel?.(event)

		const newZoomTick = normalizeZoomTick(
			zoomTick - Math.sign(event.evt.deltaY),
		)

		const oldScale = getZoom(zoomTick)
		const newScale = getZoom(newZoomTick)

		const mousePointTo = Vec.from(event.evt)
			.divide(oldScale)
			.subtract(Vec.from(translate).divide(oldScale))

		const newPos = mousePointTo
			.subtract(Vec.from(event.evt).divide(newScale))
			.multiply(-newScale)

		setZoomTick(newZoomTick)
		setTranslate(newPos)
	}

	const stageRef = useRef<Konva.Stage>(null)

	return (
		<Stage
			ref={stageRef}
			width={windowWidth}
			height={windowHeight}
			x={translate.x}
			y={translate.y}
			scaleX={getZoom(zoomTick)}
			scaleY={getZoom(zoomTick)}
			draggable
			{...props}
			onPointerDown={(event) => {
				props.onPointerDown?.(event)
				if (event.evt.button === 0) {
					event.evt.preventDefault()
					const pointer = event.currentTarget.getRelativePointerPosition()
					if (pointer) {
						setSelectionStart(Vec.from(pointer))
					}
				}
			}}
			onPointerMove={(event) => {
				if (selectionStart) {
					const pointer = event.currentTarget.getRelativePointerPosition()
					if (pointer) {
						setSelectionEnd(Vec.from(pointer))
						onSelectRegionStart()
					}
				}
			}}
			onPointerUp={(event) => {
				if (event.evt.button === 0) {
					if (selectionStart && selectionEnd) {
						const topLeft = selectionStart.zip(selectionEnd, Math.min)
						const bottomRight = selectionStart.zip(selectionEnd, Math.max)
						onSelectRegion({
							x: topLeft.x,
							y: topLeft.y,
							width: bottomRight.x - topLeft.x,
							height: bottomRight.y - topLeft.y,
						})
					} else if (selectionStart) {
						onSelectRegion({
							x: selectionStart.x,
							y: selectionStart.y,
							width: 0,
							height: 0,
						})
					}
					setSelectionStart(undefined)
					setSelectionEnd(undefined)
				}
			}}
			onDragStart={(event) => {
				props.onDragStart?.(event)
				if (event.evt.button === 0) {
				}
			}}
			onDragEnd={(event) => {
				props.onDragEnd?.(event)
				setTranslate(event.target.position())
			}}
			onContextMenu={(event) => {
				props.onContextMenu?.(event)
				event.evt.preventDefault()
			}}
			onWheel={handleWheel}
		>
			<Layer>
				{children}
				{selectionArea && (
					<Rect
						{...selectionArea}
						fill="skyblue"
						opacity={0.5}
						stroke="skyblue"
						strokeWidth={1}
					/>
				)}
			</Layer>
		</Stage>
	)
}

function BattlemapBackground({ backgroundUrl }: { backgroundUrl: string }) {
	const [image] = useImage(backgroundUrl)
	return <Image image={image} />
}
