import { useMutation, useQuery } from "convex/react"
import Konva from "konva"
import { clamp } from "lodash-es"
import { ReactNode, useImperativeHandle, useRef, useState } from "react"
import { Group, Image, Layer, Rect, Stage, StageProps } from "react-konva"
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
import type { ApiScene } from "../scenes/types.ts"
import { useBattleMapStageInfo } from "./context.ts"
import { ApiToken } from "./types.ts"

export function Battlemap({
	scene,
	backgroundUrl,
}: {
	scene: ApiScene
	backgroundUrl: string
}) {
	const tokens = useQuery(api.tokens.list, { sceneId: scene._id }) ?? []

	const [selecting, setSelecting] = useState(false)
	const [selectedIds, setSelectedIds] = useState(new Set<ApiToken["_id"]>())

	const selected = tokens.filter((it) => selectedIds.has(it._id))
	const deselected = tokens.filter((it) => !selectedIds.has(it._id))

	const tokenShapesRef = useRef(new Map<ApiToken["_id"], Konva.Shape>())

	const registerShape = (id: ApiToken["_id"], shape: Konva.Shape) => {
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

				{deselected.map((token) => (
					<DraggableTokenGroup key={token._id} tokens={[token]} scene={scene}>
						<CharacterBattlemapToken
							token={token}
							scene={scene}
							shapeRef={(shape) => {
								if (!shape) return
								registerShape(token._id, shape)
							}}
							selected={false}
							tooltipsDisabled={characterMenuController.open || selecting}
							onContextMenu={(event) =>
								characterMenuController.show(event.evt, [token.character])
							}
						/>
					</DraggableTokenGroup>
				))}

				<DraggableTokenGroup tokens={selected} scene={scene}>
					{selected.map((token) => (
						<CharacterBattlemapToken
							key={token._id}
							token={token}
							scene={scene}
							selected
							tooltipsDisabled={characterMenuController.open || selecting}
							onContextMenu={(event) =>
								characterMenuController.show(
									event.evt,
									selected.map((token) => token.character),
								)
							}
							shapeRef={(shape) => {
								if (!shape) return
								registerShape(token._id, shape)
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
	tokens,
	scene,
	children,
}: {
	tokens: ApiToken[]
	scene: ApiScene
	children: ReactNode
}) {
	const [dragStart, setDragStart] = useState<Vec>()

	const updateTokens = useMutation(api.tokens.update).withOptimisticUpdate(
		(store, args) => {
			const updatesById = new Map(args.updates.map((it) => [it.tokenId, it]))

			const tokens = store.getQuery(api.tokens.list, { sceneId: scene._id })
			if (!tokens) return

			store.setQuery(
				api.tokens.list,
				{ sceneId: scene._id },
				tokens.map((token) => {
					const update = updatesById.get(token._id)
					return update ? { ...token, ...update } : token
				}),
			)
		},
	)

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
				updateTokens({
					updates: tokens.map((it) => ({
						tokenId: it._id,
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

				updateTokens({
					updates: tokens.map((it) => ({
						tokenId: it._id,
						position: Vec.from(it.position)
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

	const stageRef = useRef<Konva.Stage | null>(null)
	const stageInfoRef = useBattleMapStageInfo()

	useImperativeHandle(stageInfoRef, () => ({
		getViewportCenter: () => {
			const windowCenter = Vec.from([
				window.innerWidth,
				window.innerHeight,
			]).divide(2)

			const stage = stageRef.current
			if (!stage) return windowCenter

			// translates the window center to a local stage coordinate
			return Vec.from(stage.getTransform().invert().point(windowCenter))
		},
	}))

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
