import { useGesture } from "@use-gesture/react"
import { useQuery } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { action, computed, observable } from "mobx"
import { observer } from "mobx-react-lite"
import * as React from "react"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { api } from "../../../convex/_generated/api"
import type { ApiToken } from "../../../convex/scenes/tokens/functions.ts"
import { getColorStyle } from "../../../shared/colors.ts"
import { Rect } from "../../common/Rect.ts"
import { sortBy } from "../../common/collection.ts"
import {
	createNonEmptyContext,
	useNonEmptyContext,
} from "../../common/context.tsx"
import { pick } from "../../common/object.ts"
import { randomItem } from "../../common/random.ts"
import type { StrictOmit } from "../../common/types.ts"
import { Vector } from "../../common/vector.ts"
import {
	DragSelectArea,
	type DragSelectStore,
	DragSelectable,
	useDragSelectStore,
} from "../../ui/DragSelect.tsx"
import { RectDrawArea } from "../../ui/RectDrawArea.tsx"
import { CharacterDnd } from "../characters/CharacterDnd.tsx"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { RoomTool, RoomToolbarStore } from "../rooms/RoomToolbarStore.tsx"
import { TokenLabel } from "./TokenLabel.tsx"
import { TokenMenu, TokenMenuContent } from "./TokenMenu.tsx"
import { TokenMeter } from "./TokenMeter.tsx"
import type { ApiScene } from "./types.ts"
import { useAddTokenMutation } from "./useAddTokenMutation.tsx"
import { useUpdateTokenMutation } from "./useUpdateTokenMutation.tsx"
import { useViewport } from "./viewport.tsx"

const dragOffset = new (class {
	@observable.ref accessor value = Vector.zero

	@action.bound set(value: Vector) {
		this.value = value
	}
})()

const DragSelectContext =
	createNonEmptyContext<DragSelectStore<ApiToken["key"]>>()

export const SceneTokens = observer(function SceneTokens({
	scene,
}: {
	scene: ApiScene
}) {
	const dragSelectStore = useDragSelectStore<ApiToken["key"]>()
	return (
		<DragSelectContext value={dragSelectStore}>
			<SceneDropzone scene={scene}>
				<SceneInteractionArea scene={scene}>
					<TokenSprites scene={scene} />
				</SceneInteractionArea>
			</SceneDropzone>
		</DragSelectContext>
	)
})

function SceneInteractionArea({
	children,
	scene,
}: {
	children: React.ReactNode
	scene: ApiScene
}) {
	const roomToolbarState = RoomToolbarStore.useState()
	return roomToolbarState.activeTool === RoomTool.Draw ?
			<RectTokenDrawArea scene={scene}>{children}</RectTokenDrawArea>
		:	<TokenSelection scene={scene}>{children}</TokenSelection>
}

function SceneDropzone({
	scene,
	children,
}: {
	scene: ApiScene
	children: React.ReactNode
}) {
	const viewport = useViewport()
	const tokens =
		useQuery(api.scenes.tokens.functions.list, { sceneId: scene._id }) ?? []
	const addToken = useAddTokenMutation()
	const updateToken = useUpdateTokenMutation()
	return (
		<CharacterDnd.Dropzone
			className="absolute inset-0"
			onDrop={(character, event) => {
				const position = Vector.from(event.clientX, event.clientY)
					.minus(viewport.offset)
					.minus((scene.cellSize / 2) * viewport.scale)
					.dividedBy(viewport.scale).xy

				const existing = tokens.find(
					(it) => it.character?._id === character._id,
				)
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

const TokenSprites = observer(function TokenSprites({
	scene,
}: {
	scene: ApiScene
}) {
	const viewport = useViewport()
	const tokens =
		useQuery(api.scenes.tokens.functions.list, { sceneId: scene._id }) ?? []
	const updateToken = useUpdateTokenMutation()
	const dragSelectStore = useNonEmptyContext(DragSelectContext)

	function updateSelectedTokenPositions() {
		for (const token of tokens) {
			if (!dragSelectStore.selected.has(token.key)) continue

			const position = Vector.from(token.position)
				.plus(dragOffset.value)
				.roundedTo(scene.cellSize).xy

			updateToken({
				sceneId: scene._id,
				key: token.key,
				position,
			})
		}
	}

	return (
		<ViewportTranslation>
			{/* sort so characters are last and are on top of everything else */}
			{sortBy(tokens, (it) => (it.character ? 1 : 0)).map((token) => (
				<TokenTranslation
					token={token}
					data-hidden={!token.visible || undefined}
					className="data-[hidden]:opacity-75"
					key={token.key}
				>
					<TokenDragSelectable
						token={token}
						onDragEnd={updateSelectedTokenPositions}
					>
						{token.character && (
							<UploadedImage
								id={token.character.imageId}
								style={Vector.from(scene.cellSize)
									.times(viewport.scale)
									.toSize()}
								emptyIcon={<Lucide.Ghost />}
								className={{
									container:
										"overflow-clip rounded bg-primary-300 shadow-md shadow-black/50",
									image: "object-cover object-top",
								}}
							/>
						)}
						{token.area && (
							<div
								className="rounded border-4 border-blue-500 bg-blue-500/30"
								style={Vector.fromSize(token.area)
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
					</TokenDragSelectable>
				</TokenTranslation>
			))}

			{/* character token decorations */}
			{Iterator.from(tokens)
				.flatMap((token) =>
					token.character ? [{ token, character: token.character }] : [],
				)
				.map(({ token, character }) => (
					<TokenTranslation
						token={token}
						className="pointer-events-none"
						key={token.key}
					>
						<div
							className="relative"
							style={Vector.from(scene.cellSize).times(viewport.scale).toSize()}
						>
							<div className="flex-center absolute inset-x-0 bottom-full gap-1.5 pb-2">
								{character.conditions.map((condition) => (
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
								{character.damage > 0 && (
									<TokenMeter
										value={character.damage / character.damageThreshold}
										className={{
											base: "text-yellow-400",
											warning: "text-orange-400",
											danger: "text-red-400",
										}}
									/>
								)}
								{character.fatigue > 0 && (
									<TokenMeter
										value={character.fatigue / character.fatigueThreshold}
										className={{
											base: "text-green-400",
											warning: "text-blue-400",
											danger: "text-purple-400",
										}}
									/>
								)}
							</div>
							<TokenLabel
								text={character.displayName}
								subText={character.displayPronouns}
							/>
						</div>
					</TokenTranslation>
				))
				.toArray()}

			{/* area size labels */}
			{Iterator.from(tokens)
				.flatMap((token) => {
					if (!token.area) return []
					return [
						{
							token,
							area: token.area,
							gridSize: Vector.fromSize(token.area).dividedBy(scene.cellSize)
								.rounded,
						},
					]
				})
				.map(({ token, area, gridSize }) => (
					<TokenTranslation
						token={token}
						className="flex-center pointer-events-none"
						style={{
							...pick(area, ["width", "height"]),
							scale: viewport.scale,
						}}
						key={token.key}
					>
						<p className="rounded-lg bg-black p-3 text-3xl/none font-bold text-white opacity-50">
							{gridSize.x}x{gridSize.y}
						</p>
					</TokenTranslation>
				))
				.toArray()}
		</ViewportTranslation>
	)
})

const ViewportTranslation = observer(
	({ children }: { children: React.ReactNode }) => {
		const viewport = useViewport()
		return (
			<div
				className="absolute left-0 top-0 origin-top-left"
				style={{ translate: viewport.offset.css.translate() }}
			>
				{children}
			</div>
		)
	},
)

const TokenTranslation = observer(function TokenTranslation({
	token,
	...props
}: React.ComponentProps<"div"> & {
	token: ApiToken
}) {
	const dragSelectStore = useNonEmptyContext(DragSelectContext)
	const isSelected = dragSelectStore.isSelected(token.key)
	const viewport = useViewport()

	const translate = React.useMemo(() => {
		return computed(() => {
			return Vector.from(token.position)
				.times(viewport.scale)
				.plus(isSelected ? dragOffset.value.times(viewport.scale) : Vector.zero)
				.css.translate()
		})
	}, [isSelected, token, viewport])

	return (
		<div
			{...props}
			className={twMerge(
				"absolute left-0 top-0 origin-top-left",
				props.className,
			)}
			style={{
				translate: translate.get(),
				...props.style,
			}}
		/>
	)
})

const RectTokenDrawArea = observer(function RectTokenDrawArea({
	children,
	scene,
}: {
	children: React.ReactNode
	scene: ApiScene
}) {
	const [previewArea, setPreviewArea] = useState<Rect>()
	const viewport = useViewport()
	const roomToolbarActions = RoomToolbarStore.useActions()
	const addToken = useAddTokenMutation()

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

	return (
		<RectDrawArea
			className="absolute inset-0"
			preview={false}
			rect={previewArea}
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
					sceneId: scene._id,
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
				roomToolbarActions.enableSelectTool()
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
})

const TokenDragSelectable = observer(function TokenDragSelectable({
	children,
	token,
	onDragEnd,
	...props
}: {
	children: React.ReactNode
	token: ApiToken
	onDragEnd: () => void
} & StrictOmit<React.ComponentProps<"div">, "onDragEnd">) {
	const viewport = useViewport()
	const dragSelectStore = useNonEmptyContext(DragSelectContext)

	const bindDrag = useGesture(
		{
			onDrag: (state) => {
				dragOffset.set(Vector.from(state.movement))
			},
			onDragEnd: () => {
				onDragEnd()
				dragOffset.set(Vector.zero)
			},
		},
		{
			drag: {
				from: [0, 0],
			},
			transform: (input) => [
				...Vector.from(input).minus(viewport.offset).dividedBy(viewport.scale)
					.tuple,
			],
		},
	)

	return (
		<DragSelectable
			{...props}
			{...bindDrag()}
			store={dragSelectStore}
			item={token.key}
			className={twMerge("group touch-none", props.className)}
			data-token-drag-selectable
		>
			{children}
		</DragSelectable>
	)
})

const TokenSelection = observer(function TokenSelection({
	children,
	scene,
}: {
	children: React.ReactNode
	scene: ApiScene
}) {
	const dragSelectStore = useNonEmptyContext(DragSelectContext)
	const tokens =
		useQuery(api.scenes.tokens.functions.list, { sceneId: scene._id }) ?? []
	const selectedTokens = tokens.filter((it) =>
		dragSelectStore.isSelected(it.key),
	)
	return (
		<DragSelectArea
			className="absolute inset-0 size-full"
			store={dragSelectStore}
		>
			{children}
			<TokenMenu
				scene={scene}
				selectedTokens={selectedTokens}
				open={
					dragOffset.value.equals(Vector.zero) &&
					selectedTokens.length > 0 &&
					dragSelectStore.area == null
				}
				onClose={() => {
					dragSelectStore.clear()
				}}
			>
				<TokenMenuContent
					selectedTokens={selectedTokens}
					onTokenSelected={(token) => {
						dragSelectStore.clear()
						dragSelectStore.setItemSelected(token.key, true)
					}}
				/>
			</TokenMenu>
		</DragSelectArea>
	)
})
