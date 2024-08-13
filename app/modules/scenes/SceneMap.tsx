import { useGesture, useWheel } from "@use-gesture/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as React from "react"
import { useState } from "react"
import { Rect } from "../../../common/Rect.ts"
import { Vector } from "../../../common/Vector.ts"
import { jsonTextParser } from "../../../common/json.ts"
import { randomItem } from "../../../common/random.ts"
import { DragSelectArea } from "../../ui/DragSelect.tsx"
import { RectDrawArea } from "../../ui/RectDrawArea.tsx"
import { getApiImageUrl } from "../api-images/helpers.ts"
import { characterDragData } from "../characters/types.ts"
import type { RoomToolbarStore } from "../rooms/RoomToolbarStore.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { PingHandler } from "./PingHandler.tsx"
import { useSceneContext } from "./SceneContext.tsx"
import { SceneGrid } from "./SceneGrid.tsx"
import { TokenElementLayer } from "./TokenElementLayer.tsx"
import { TokenMenu } from "./TokenMenu.tsx"
import { useCurrentRoomScene, useCurrentSceneTokens } from "./hooks.ts"
import { useAddTokenMutation } from "./useAddTokenMutation.tsx"
import { useUpdateTokenMutation } from "./useUpdateTokenMutation.tsx"

export function SceneMap({ store }: { store: RoomToolbarStore }) {
	const { tokenSelectStore } = useSceneContext()
	return (
		<WheelHandler>
			<SceneBackground />
			<SceneGrid />
			<DragHandler>
				<PingHandler>
					<CharacterTokenDropzone>
						{store.activeTool === "Draw" ?
							<RectTokenDrawArea onTokenAdded={store.activateSelectTool}>
								<TokenElementLayer />
							</RectTokenDrawArea>
						:	<DragSelectArea
								className="absolute inset-0"
								{...tokenSelectStore.areaProps()}
							>
								<TokenElementLayer />
							</DragSelectArea>
						}
					</CharacterTokenDropzone>
				</PingHandler>
			</DragHandler>
			<TokenMenu />
		</WheelHandler>
	)
}

function WheelHandler({ children }: { children: React.ReactNode }) {
	const context = useSceneContext()

	const bind = useWheel((state) => {
		const target = state.event.currentTarget as HTMLElement | undefined
		// wheel events can bubble up through the _react tree_
		// through portals rendered in elements outside of this one,
		// so we have to explicitly check that the scrolled element
		// is actually inside of this in the DOM tree
		if (!target?.contains(state.event.target as Node)) {
			return
		}

		context.viewport.zoom(-state.delta[1], [
			state.event.clientX,
			state.event.clientY,
		])
	}, {})

	return <div {...bind()}>{children}</div>
}

function DragHandler({ children }: { children: React.ReactNode }) {
	const context = useSceneContext()

	const bind = useGesture(
		{
			onDrag: (state) => {
				context.viewport.move(state.delta)
			},
			onDragEnd: () => {
				// prevent a context menu from showing after we finish dragging,
				// but remove the handler after a delay in case this doesn't run for some reason
				const handleContextMenu = (event: MouseEvent): void => {
					event.preventDefault()
				}
				document.addEventListener("contextmenu", handleContextMenu, {
					once: true,
					capture: true,
				})
				setTimeout(() => {
					document.removeEventListener("contextmenu", handleContextMenu, {
						capture: true,
					})
				}, 500)
			},
		},
		{
			drag: {
				pointer: {
					buttons: [2],
				},
				threshold: 8,
				keyboardDisplacement: 0,
			},
		},
	)

	return (
		<div {...bind()} className="absolute inset-0 touch-none">
			{children}
		</div>
	)
}

function SceneBackground() {
	const scene = useCurrentRoomScene()
	const background = scene?.background

	const { viewport } = useSceneContext()

	const windowSize = useWindowSize()
	const tileSize = 1024

	if (!background) return null

	const tileStart = viewport.offset.dividedBy(-tileSize * viewport.scale).floor
	const tileEnd = tileStart
		.plus(windowSize.dividedBy(viewport.scale).dividedBy(tileSize).ceiling)
		.plus(1)

	const backgroundSize = Vector.from(scene?.backgroundDimensions ?? Vector.zero)

	const clampedTileStart = Vector.bottomRightMost(tileStart, Vector.zero)
	const clampedTileEnd = Vector.topLeftMost(
		tileEnd,
		backgroundSize.dividedBy(tileSize).ceiling,
	)

	const tilePositions = Iterator.range(
		clampedTileStart.x,
		clampedTileEnd.x,
	).flatMap((x) =>
		Iterator.range(clampedTileStart.y, clampedTileEnd.y).map((y) =>
			Vector.from(x, y),
		),
	)

	return (
		<div
			className="absolute left-0 top-0 origin-top-left will-change-transform"
			style={{
				scale: viewport.scale,
				translate: viewport.offset.floor.css.translate(),
			}}
		>
			{tilePositions
				.map((position) => (
					<div
						key={`${position.x}-${position.y}`}
						style={{
							backgroundImage: `url(${getApiImageUrl(background)}?area=${position.x * tileSize},${position.y * tileSize},${tileSize},${tileSize})`,
							backgroundRepeat: "no-repeat",
							width: tileSize,
							height: tileSize,
							translate: position.times(tileSize).css.translate(),
						}}
						className="absolute left-0 top-0 origin-top-left scale-[1.002] will-change-transform"
					/>
				))
				.toArray()}
		</div>
	)
}

function useWindowSize() {
	const [windowSize, setWindowSize] = useState<Vector>(() => {
		return typeof window !== "undefined" ?
				Vector.from(window.innerWidth, window.innerHeight)
			:	Vector.zero
	})

	React.useEffect(() => {
		const handleResize = () => {
			setWindowSize(Vector.from(window.innerWidth, window.innerHeight))
		}
		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [])

	return windowSize
}

function CharacterTokenDropzone({ children }: { children: React.ReactNode }) {
	const { currentScene } = useRoom()
	const {
		scene: { cellSize },
		...context
	} = useSceneContext()
	const tokens = useCurrentSceneTokens()
	const addToken = useAddTokenMutation()
	const updateToken = useUpdateTokenMutation()

	if (!currentScene) return null

	return (
		<div
			className="absolute inset-0"
			onDragOver={(event) => {
				event.preventDefault()
				event.dataTransfer.dropEffect = "copy"
			}}
			onDrop={(event) => {
				event.preventDefault()

				const data = jsonTextParser
					.pipe(characterDragData)
					.optional()
					.catch(() => undefined)
					.parse(event.dataTransfer.getData("text"))
				if (!data) return

				const position = context
					.mapPositionFromViewportPosition(event.clientX, event.clientY)
					.floorTo(cellSize).xy

				const existing = tokens.find(
					(it) => it.character?._id === data.characterId,
				)
				if (existing) {
					updateToken({
						key: existing.key,
						sceneId: currentScene,
						position,
					})
				} else {
					addToken({
						sceneId: currentScene,
						characterId: data.characterId,
						position,
						visible: data.visible,
					})
				}
			}}
		>
			{children}
		</div>
	)
}

function RectTokenDrawArea({
	children,
	onTokenAdded,
}: {
	children: React.ReactNode
	onTokenAdded?: () => void
}) {
	const { scene, viewport } = useSceneContext()
	const { currentScene } = useRoom()
	const addToken = useAddTokenMutation()
	const [previewArea, setPreviewArea] = useState<Rect>()

	const gridSnappedPreviewArea =
		previewArea &&
		Rect.from({
			topLeft: previewArea.topLeft
				.minus(viewport.offset)
				.floorTo(scene.cellSize * viewport.scale)
				.plus(viewport.offset),
			bottomRight: previewArea.bottomRight
				.minus(viewport.offset)
				.ceilingTo(scene.cellSize * viewport.scale)
				.plus(viewport.offset),
		})

	const gridSize = gridSnappedPreviewArea?.size.dividedBy(
		scene.cellSize * viewport.scale,
	).rounded

	if (!currentScene) return null

	return (
		<RectDrawArea
			className="absolute inset-0"
			preview={false}
			rect={previewArea}
			onStart={setPreviewArea}
			onRectChange={setPreviewArea}
			onFinish={() => {
				if (!gridSnappedPreviewArea) {
					throw new Error("grid preview area is undefined")
				}

				const position = gridSnappedPreviewArea.topLeft
					.minus(viewport.offset)
					.dividedBy(viewport.scale).xy

				const size = gridSnappedPreviewArea.size
					.dividedBy(viewport.scale)
					.toSize()

				addToken({
					sceneId: currentScene,
					visible: true,
					position,
					area: {
						...size,
						color: randomItem([
							"red",
							"orange",
							"yellow",
							"green",
							"blue",
							"purple",
						]),
					},
				})
				onTokenAdded?.()
				setPreviewArea(undefined)
			}}
		>
			<div className="pointer-events-none size-full opacity-50">{children}</div>
			{gridSnappedPreviewArea && (
				<div
					className="flex-center absolute left-0 top-0 rounded border-4 border-blue-500 bg-blue-500/30"
					style={{
						translate: gridSnappedPreviewArea.topLeft.css.translate(),
						...gridSnappedPreviewArea.size.toSize(),
					}}
				>
					<p className="rounded-lg bg-black p-3 text-xl/none font-bold text-white opacity-50">
						{gridSize?.x}x{gridSize?.y}
					</p>
				</div>
			)}
		</RectDrawArea>
	)
}
