import { useGesture, useWheel } from "@use-gesture/react"
import { useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import * as React from "react"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { api } from "../../../convex/_generated/api"
import type { ApiToken } from "../../../convex/scenes/tokens/functions.ts"
import { getColorStyle } from "../../../shared/colors.ts"
import { Rect } from "../../common/Rect.ts"
import { sortBy } from "../../common/collection.ts"
import { randomItem } from "../../common/random.ts"
import { Vector } from "../../common/vector.ts"
import { DragSelectArea } from "../../ui/DragSelect.tsx"
import { RectDrawArea } from "../../ui/RectDrawArea.tsx"
import { CharacterDnd } from "../characters/CharacterDnd.tsx"
import { getThresholds } from "../characters/helpers.ts"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { getApiImageUrl } from "../images/getApiImageUrl.tsx"
import { RoomTool, RoomToolbarStore } from "../rooms/RoomToolbarStore.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { useSceneContext } from "./SceneContext.tsx"
import { SceneGrid } from "./SceneGrid.tsx"
import { TokenLabel } from "./TokenLabel.tsx"
import { TokenMenu } from "./TokenMenu.tsx"
import { TokenMeter } from "./TokenMeter.tsx"
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
				<CharacterTokenDropzone>
					{state.activeTool === RoomTool.Draw ?
						<RectTokenDrawArea>
							<TokenElements />
						</RectTokenDrawArea>
					:	<DragSelectArea className="absolute inset-0" {...tokenSelectStore.areaProps()}>
							<TokenElements />
						</DragSelectArea>
					}
				</CharacterTokenDropzone>
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
				const position = context.mapPositionFromViewportPosition(event)

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

function TokenElements() {
	const { viewport, tokens } = useSceneContext()
	const room = useRoom()
	return (
		<div
			className="absolute left-0 top-0 origin-top-left"
			style={{ translate: viewport.offset.css.translate() }}
		>
			{/* sort so characters are last and are on top of everything else */}
			{sortBy(tokens, (it) => (it.character ? 1 : 0)).map((token) => (
				<TokenElement
					token={token}
					isCurrentCombatMember={token.character?._id === room.combat?.currentMemberId}
					key={token.key}
				/>
			))}
			{tokens.map((token) => (
				<CharacterTokenDecoration key={token.key} token={token} />
			))}
			{tokens.map((token) => (
				<AreaSizeLabel key={token.key} token={token} />
			))}
		</div>
	)
}

function TokenElement({
	token,
	isCurrentCombatMember,
}: {
	token: ApiToken
	isCurrentCombatMember: boolean
}) {
	const {
		scene,
		viewport,
		tokens,
		tokenSelectStore: { selectableProps, isSelected },
		tokenDragOffset,
		setTokenDragOffset,
	} = useSceneContext()

	const translate = useTokenTranslate(token)
	const updateToken = useUpdateTokenMutation()

	function updateSelectedTokenPositions() {
		for (const token of tokens) {
			if (!isSelected(token.key)) continue

			const position = Vector.from(token.position)
				.plus(tokenDragOffset)
				.roundedTo(scene.cellSize).xy

			updateToken({
				sceneId: scene._id,
				key: token.key,
				position,
			})
		}
	}

	const bind = useGesture(
		{
			onDrag: (state) => {
				setTokenDragOffset(Vector.from(state.movement))
			},
			onDragEnd: () => {
				updateSelectedTokenPositions()
				setTokenDragOffset(Vector.zero)
			},
		},
		{
			drag: {
				from: [0, 0],
			},
			transform: (input) => [
				...Vector.from(input).minus(viewport.offset).dividedBy(viewport.scale).tuple,
			],
		},
	)

	return (
		<div
			{...bind()}
			data-hidden={!token.visible || undefined}
			className="absolute left-0 top-0 origin-top-left touch-none data-[hidden]:opacity-75"
			style={{ translate }}
		>
			<div {...selectableProps(token.key)} className="group relative">
				<div
					data-is-current-combat-member={isCurrentCombatMember}
					className="pointer-events-none absolute inset-0 animate-pulse rounded-lg outline-dashed outline-4 outline-offset-[6px] outline-transparent data-[is-current-combat-member=true]:outline-primary-700 "
				></div>
				{token.character && (
					<UploadedImage
						id={token.character.imageId}
						style={Vector.from(scene.cellSize).times(viewport.scale).toSize()}
						emptyIcon={<Lucide.Ghost />}
						className={{
							container: "overflow-clip rounded bg-primary-300 shadow-md shadow-black/50",
							image: "object-cover object-top",
						}}
					/>
				)}
				{token.area && (
					<div
						className="rounded border-4 border-blue-500 bg-blue-500/30"
						style={Vector.fromSize(token.area)
							.roundedTo(scene.cellSize)
							.times(viewport.scale)
							.toSize()}
					/>
				)}
				{token.visible ? null : (
					<div className="flex-center absolute inset-0">
						<Lucide.EyeOff className="size-2/3 opacity-50" />
					</div>
				)}
				<div className="pointer-events-none absolute inset-0 rounded bg-primary-600/25 opacity-0 outline outline-4 outline-primary-700 group-data-[selected]:opacity-100" />
			</div>
		</div>
	)
}

function CharacterTokenDecoration({ token }: { token: ApiToken }) {
	const { scene, viewport } = useSceneContext()
	const translate = useTokenTranslate(token)

	if (!token.character) {
		return null
	}

	const thresholds = getThresholds(token.character)

	return (
		<div
			className="pointer-events-none absolute left-0 top-0 origin-top-left"
			style={{ translate }}
		>
			<div className="relative" style={Vector.from(scene.cellSize).times(viewport.scale).toSize()}>
				<div className="flex-center absolute inset-x-0 bottom-full gap-1.5 pb-2">
					{token.character.conditions.map((condition) => (
						<p
							key={condition.name}
							className={twMerge(
								getColorStyle(condition.color),
								"flex-center-row h-6 rounded px-1.5 text-sm leading-none",
							)}
						>
							{condition.name}
						</p>
					))}
					{token.character.damage > 0 && (
						<TokenMeter
							value={token.character.damage / thresholds.damage}
							className={{
								base: "text-yellow-400",
								warning: "text-orange-400",
								danger: "text-red-400",
							}}
						/>
					)}
					{token.character.fatigue > 0 && (
						<TokenMeter
							value={token.character.fatigue / thresholds.fatigue}
							className={{
								base: "text-green-400",
								warning: "text-blue-400",
								danger: "text-purple-400",
							}}
						/>
					)}
				</div>
				<TokenLabel text={token.character.displayName} subText={token.character.displayPronouns} />
			</div>
		</div>
	)
}

function AreaSizeLabel({ token }: { token: ApiToken }) {
	const { scene, viewport } = useSceneContext()
	const translate = useTokenTranslate(token)

	if (!token.area) {
		return null
	}

	const dimensions = Vector.fromSize(token.area).dividedBy(scene.cellSize).rounded

	return (
		<div
			className="flex-center pointer-events-none absolute left-0 top-0 origin-top-left"
			style={{
				...Vector.fromSize(token.area).roundedTo(scene.cellSize).toSize(),
				scale: viewport.scale,
				translate,
			}}
		>
			<p className="rounded-lg bg-black p-3 text-3xl/none font-bold text-white opacity-50">
				{dimensions.x}x{dimensions.y}
			</p>
		</div>
	)
}

function useTokenTranslate(token: ApiToken) {
	const { viewport, tokenSelectStore, tokenDragOffset } = useSceneContext()
	const isSelected = tokenSelectStore.isSelected(token.key)
	return Vector.from(token.position)
		.times(viewport.scale)
		.plus(isSelected ? tokenDragOffset.times(viewport.scale) : Vector.zero)
		.css.translate()
}
