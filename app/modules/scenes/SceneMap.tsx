import { useGesture, useWheel } from "@use-gesture/react"
import * as React from "react"
import { useState } from "react"
import { loadImage } from "~/helpers/dom/images.ts"
import { Rect } from "../../helpers/Rect.ts"
import { randomItem } from "../../helpers/random.ts"
import { DragSelectArea } from "../../ui/DragSelect.tsx"
import { RectDrawArea } from "../../ui/RectDrawArea.tsx"
import { getApiImageUrl } from "../api-images/helpers.ts"
import { useOffscreenCanvas } from "../canvas/offscreen.ts"
import type { OffscreenCanvasOperation } from "../canvas/offscreen.worker.ts"
import { CharacterResource } from "../characters/CharacterResource.tsx"
import { parseResourceDragData } from "../resources/Resource.tsx"
import { RoomTool, RoomToolbarStore } from "../rooms/RoomToolbarStore.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { PingHandler } from "./PingHandler.tsx"
import { useSceneContext } from "./SceneContext.tsx"
import { SceneGrid } from "./SceneGrid.tsx"
import { TokenElementLayer } from "./TokenElementLayer.tsx"
import { TokenMenu } from "./TokenMenu.tsx"
import { useCurrentScene, useCurrentSceneTokens } from "./hooks.ts"
import { useAddTokenMutation } from "./useAddTokenMutation.tsx"
import { useUpdateTokenMutation } from "./useUpdateTokenMutation.tsx"

export function SceneMap() {
	const state = RoomToolbarStore.useState()
	const { tokenSelectStore } = useSceneContext()
	return (
		<WheelHandler>
			<SceneBackground />
			<SceneGrid />
			<DragHandler>
				<PingHandler>
					<CharacterTokenDropzone>
						{state.activeTool === RoomTool.Draw ?
							<RectTokenDrawArea>
								<TokenElementLayer />
							</RectTokenDrawArea>
						:	<DragSelectArea className="absolute inset-0" {...tokenSelectStore.areaProps()}>
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

		context.viewport.zoom(-state.delta[1], [state.event.clientX, state.event.clientY])
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
	const scene = useCurrentScene()
	const bitmap = useImageBitmap(scene?.background && getApiImageUrl(scene.background))
	const { containerRef, render } = useOffscreenCanvas()
	const { viewport } = useSceneContext()

	React.useEffect(() => {
		if (!bitmap) return
		const operations: OffscreenCanvasOperation[] = [
			{
				type: "drawImage",
				image: bitmap,
				args: [0, 0, 100, 100, viewport.offset.x, viewport.offset.y, 100, 100],
			},
		]
		render(operations)
	}, [bitmap, render, viewport.offset.x, viewport.offset.y])

	return <div className="absolute inset-0 size-full" ref={containerRef} />
}

function useImageBitmap(backgroundUrl: string | null | undefined) {
	const [bitmap, setBitmap] = React.useState<ImageBitmap>()
	React.useEffect(() => {
		if (!backgroundUrl) {
			setBitmap(undefined)
			return
		}

		let ignore = false
		void (async () => {
			const image = await loadImage(backgroundUrl)
			const bitmap = await createImageBitmap(image)
			if (!ignore) setBitmap(bitmap)
		})()
		return () => {
			ignore = true
		}
	}, [backgroundUrl])
	return bitmap
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

				const data = parseResourceDragData(CharacterResource, event.dataTransfer.getData("text"))
				if (!data) return

				const position = context
					.mapPositionFromViewportPosition(event.clientX, event.clientY)
					.floorTo(cellSize).xy

				const existing = tokens.find((it) => it.character?._id === data.characterId)
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

function RectTokenDrawArea({ children }: { children: React.ReactNode }) {
	const { scene, viewport } = useSceneContext()
	const { currentScene } = useRoom()
	const roomToolbarActions = RoomToolbarStore.useActions()
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

	const gridSize = gridSnappedPreviewArea?.size.dividedBy(scene.cellSize * viewport.scale).rounded

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

				const size = gridSnappedPreviewArea.size.dividedBy(viewport.scale).toSize()

				addToken({
					sceneId: currentScene,
					visible: true,
					position,
					area: {
						...size,
						color: randomItem(["red", "orange", "yellow", "green", "blue", "purple"]),
					},
				})
				roomToolbarActions.enableSelectTool()
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
