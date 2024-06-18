import { useGesture, useWheel } from "@use-gesture/react"
import { useQuery } from "convex/react"
import * as React from "react"
import { useState } from "react"
import { api } from "../../../convex/_generated/api"
import { Rect } from "../../lib/primitives/Rect.ts"
import { randomItem } from "../../lib/random.ts"
import { DragSelectArea } from "../../ui/DragSelect.tsx"
import { RectDrawArea } from "../../ui/RectDrawArea.tsx"
import { CharacterDnd } from "../characters/CharacterDnd.tsx"
import { getApiImageUrl } from "../images/getApiImageUrl.tsx"
import { RoomTool, RoomToolbarStore } from "../rooms/RoomToolbarStore.tsx"
import { PingHandler } from "./PingHandler.tsx"
import { useSceneContext } from "./SceneContext.tsx"
import { SceneGrid } from "./SceneGrid.tsx"
import { TokenElementLayer } from "./TokenElementLayer.tsx"
import { TokenMenu } from "./TokenMenu.tsx"
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
	const { scene, viewport } = useSceneContext()

	return scene.background ?
			<img
				src={getApiImageUrl(scene.background)}
				alt=""
				draggable={false}
				style={{
					width: scene.backgroundDimensions?.x,
					height: scene.backgroundDimensions?.y,
					scale: viewport.scale,
					translate: `${viewport.offset.x}px ${viewport.offset.y}px`,
				}}
				className="max-w-[unset] origin-top-left"
			/>
		:	null
}

function CharacterTokenDropzone({ children }: { children: React.ReactNode }) {
	const { scene, ...context } = useSceneContext()
	const tokens = useQuery(api.scenes.tokens.functions.list, { sceneId: scene._id }) ?? []
	const addToken = useAddTokenMutation()
	const updateToken = useUpdateTokenMutation()
	return (
		<CharacterDnd.Dropzone
			className="absolute inset-0"
			onDrop={(character, event) => {
				const position = context
					.mapPositionFromViewportPosition(event.clientX, event.clientY)
					.floorTo(scene.cellSize).xy

				const existing = tokens.find((it) => it.character?._id === character._id)
				if (existing) {
					updateToken({
						key: existing.key,
						sceneId: scene._id,
						position,
					})
				} else {
					addToken({
						sceneId: scene._id,
						characterId: character._id,
						position,
						visible: character.visible,
					})
				}
			}}
		>
			{children}
		</CharacterDnd.Dropzone>
	)
}

function RectTokenDrawArea({ children }: { children: React.ReactNode }) {
	const { scene, viewport } = useSceneContext()
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
					sceneId: scene._id,
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
