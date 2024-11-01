import { useGesture } from "@use-gesture/react"
import { useMutation, useQuery } from "convex/react"
import { clamp, omit } from "lodash-es"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { ApiImage } from "~/components/ApiImage.tsx"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { Sprite, SpriteProps } from "~/features/battlemap/Sprite.tsx"
import { readonly } from "~/lib/common.ts"
import { MouseButtons } from "~/lib/dom.ts"
import { groupBy, keyBy } from "~/lib/iterable.ts"
import { useKeyPressed } from "~/lib/keyboard.ts"
import { Rect } from "~/lib/rect.ts"
import { useAsyncQueue } from "~/lib/useAsyncQueue.ts"
import { Vec, VecInput } from "~/shared/vec.ts"
import { useCharacterEditorDialog } from "../characters/CharacterEditorDialog.tsx"
import { getConditionColorClasses } from "../characters/conditions.ts"
import { ApiCharacter } from "../characters/types.ts"
import { ApiScene } from "../scenes/types.ts"
import { ActivityTokenElement } from "./ActivityTokenElement.tsx"
import { CharacterTokenElement } from "./CharacterTokenElement.tsx"
import { useTokenMenu } from "./TokenMenu.tsx"
import { ApiToken } from "./types.ts"
import { useTokenMapMenu } from "./useTokenMapMenu.tsx"

export function TokenMap({ scene }: { scene: ApiScene }) {
	const viewport = useViewport()
	const tokenState = useTokens(scene)
	const viewportMenu = useTokenMapMenu()
	const tokenMenu = useTokenMenu()
	const characterEditor = useCharacterEditorDialog()

	const selection = useSelection({
		transformPointerPosition: viewport.toMapPosition,
		onSelectionChange: (area) => {
			const selectedIds = new Set(
				tokenState.tokens
					.filter((it) => area.intersects([it.position, scene.cellSize]))
					.map((it) => it._id),
			)
			tokenState.setSelectedTokenIds(selectedIds)
		},
		onContextMenu: (screenPosition) => {
			viewportMenu.show(screenPosition, viewport.toMapPosition(screenPosition))
		},
	})

	const altPressed = useKeyPressed("Alt")

	const isTokenVisible = (token: ApiToken) =>
		!selection.selecting &&
		tokenState.tokenDragOffset.equals(Vec.zero) &&
		(visibleTokenAnnotations.get(token._id) ||
			tokenState.selectedTokenIds.has(token._id) ||
			altPressed)

	const [visibleTokenAnnotations, setVisibleTokenAnnotations] = useState(
		new Map<Id<"characterTokens">, boolean>(),
	)

	function updateVisibleAnnotations(
		tokenId: Id<"characterTokens">,
		visible: boolean,
	) {
		setVisibleTokenAnnotations((prev) => {
			const next = new Map(prev)
			next.set(tokenId, visible)
			return next
		})
	}

	const bindTokenGestureHandlers = useGesture(
		{
			onPointerDown: ({ event }) => {
				const tokenId = tokenState.getElementTokenId(
					event.currentTarget as HTMLElement,
				)
				const newSelectedTokenIds = tokenState.selectedTokenIds.has(tokenId)
					? tokenState.selectedTokenIds
					: new Set([tokenId])
				tokenState.setSelectedTokenIds(newSelectedTokenIds)
			},
			onDragStart: ({ xy }) => {
				tokenState.setTokenDragStart(viewport.toMapPosition(xy))
				tokenState.setTokenDragEnd(viewport.toMapPosition(xy))
			},
			onDrag: (info) => {
				tokenState.setTokenDragEnd(viewport.toMapPosition(info.xy))
			},
			onDragEnd: () => {
				tokenState.setTokenDragStart(Vec.zero)
				tokenState.setTokenDragEnd(Vec.zero)
				tokenState.updateTokens({
					updates: tokenState.selectedTokens.map((token) => ({
						tokenId: token._id,
						position: token.position.toJSON(),
						updatedAt: Date.now(),
					})),
				})
			},

			onPointerEnter: ({ event }) => {
				const tokenId = tokenState.getElementTokenId(
					event.currentTarget as HTMLElement,
				)
				updateVisibleAnnotations(tokenId, true)
			},
			onPointerLeave: ({ event }) => {
				const tokenId = tokenState.getElementTokenId(
					event.currentTarget as HTMLElement,
				)
				updateVisibleAnnotations(tokenId, false)
			},
			onContextMenu: ({ event }) => {
				const tokenId = tokenState.getElementTokenId(
					event.currentTarget as HTMLElement,
				)
				if (tokenState.selectedTokenIds.has(tokenId)) {
					tokenMenu.handleTrigger(event, tokenState.selectedTokenIds)
				} else {
					tokenState.setSelectedTokenIds(new Set([tokenId]))
					tokenMenu.handleTrigger(event, new Set([tokenId]))
				}
			},
			onDoubleClick: ({ event }) => {
				const tokenId = tokenState.getElementTokenId(
					event.currentTarget as HTMLElement,
				)
				const token = tokenState.tokensById.get(tokenId)
				if (!token || !token.characterId) return
				characterEditor.show(token.characterId)
			},
		},
		{
			eventOptions: {},
			drag: {
				preventDefault: true,
			},
		},
	)

	const tokenGroups = groupBy(tokenState.tokens, (token) =>
		token.characterId ? "characters" : "activities",
	)

	return (
		<>
			{viewportMenu.element}
			{characterEditor.element}
			<div
				{...viewport.bindRootGestureHandlers()}
				className="absolute inset-0 touch-none select-none overflow-clip [&_*]:will-change-[transform,opacity]"
			>
				<Sprite
					position={viewport.viewportOffset}
					scale={viewport.viewportScale}
					pointerEvents
				>
					<ApiImage
						imageId={scene.battlemapBackgroundId}
						className="max-w-none brightness-75"
					/>
				</Sprite>

				<div
					className="absolute inset-0 touch-none"
					{...selection.bindSelectionHandlers()}
				></div>

				<Sprite
					position={viewport.viewportOffset}
					scale={viewport.viewportScale}
				>
					{tokenGroups.get("characters")?.map((token) => {
						if (!token.characterId) return
						return (
							<CharacterTokenElement
								{...bindTokenGestureHandlers()}
								key={token._id}
								token={token}
								character={token.character}
								scene={scene}
								selected={tokenState.selectedTokenIds.has(token._id)}
								pointerEvents
								data-token-id={token._id}
							/>
						)
					})}
					{tokenGroups.get("activities")?.map((token) => (
						<ActivityTokenElement
							key={token._id}
							token={token}
							scene={scene}
							selected={tokenState.selectedTokenIds.has(token._id)}
							pointerEvents
							data-token-id={token._id}
							{...bindTokenGestureHandlers()}
							onContextMenu={(event) => {
								if (tokenState.selectedTokenIds.has(token._id)) {
									tokenMenu.handleTrigger(event, tokenState.selectedTokenIds)
								} else {
									tokenState.setSelectedTokenIds(new Set([token._id]))
									tokenMenu.handleTrigger(event, new Set([token._id]))
								}
							}}
						/>
					))}
				</Sprite>

				<Sprite
					position={selection.selectionArea.topLeft}
					size={selection.selectionArea.size}
					className="rounded-sm border-2 border-accent-900 bg-accent-600/50 opacity-0 transition-opacity"
					style={{
						...(selection.selecting && {
							opacity: 1,
							transitionDuration: "0",
						}),
					}}
				/>

				<Sprite position={viewport.viewportOffset} pointerEvents={false}>
					{tokenGroups.get("characters")?.map((token) => {
						if (!token.characterId) return
						return (
							<CharacterTokenAnnotations
								key={token._id}
								position={Vec.from(token.position).times(
									viewport.viewportScale,
								)}
								size={Vec.from(scene.cellSize).times(viewport.viewportScale)}
								character={token.character}
								visible={isTokenVisible(token)}
							/>
						)
					})}
				</Sprite>
			</div>
		</>
	)
}

function CharacterTokenAnnotations({
	character,
	visible,
	...props
}: {
	character: ApiCharacter
	visible: boolean
} & SpriteProps) {
	return (
		<Sprite
			{...props}
			className={twMerge(
				"opacity-0 transition-opacity will-change-[opacity] data-[visible=true]:opacity-95",
				props.className,
			)}
			data-visible={visible}
		>
			<Sprite.Attachment side="top" className="p-4">
				<Sprite.Badge>
					<p className="text-base/5 empty:hidden">
						{character.identity?.name ?? (
							<span className="opacity-50">(unknown)</span>
						)}
					</p>
					<p className="text-sm/5 opacity-80 empty:hidden">
						{[character.race, character.identity?.pronouns]
							.filter(Boolean)
							.join(" • ")}
					</p>
				</Sprite.Badge>
			</Sprite.Attachment>
			<Sprite.Attachment side="bottom" className="items-center p-4 gap-1">
				{character.full && (
					<div className="flex gap-1">
						<Sprite.Meter
							value={character.full.health}
							max={character.full.healthMax}
							className={{
								root: "border-green-700 bg-green-500/50",
								fill: "bg-green-500",
							}}
						/>
						<Sprite.Meter
							value={character.full.resolve}
							max={character.full.resolveMax}
							className={{
								root: "border-blue-700 bg-blue-500/50",
								fill: "bg-blue-500",
							}}
						/>
					</div>
				)}
				<div className="flex w-64 flex-wrap justify-center gap-1">
					{[...new Set(character.conditions)].map((condition) => (
						<Sprite.Badge
							key={condition}
							className={twMerge(
								"px-2.5 py-1 text-sm leading-4",
								getConditionColorClasses(condition),
							)}
						>
							{condition}
						</Sprite.Badge>
					))}
				</div>
			</Sprite.Attachment>
		</Sprite>
	)
}

function useViewport() {
	const [viewportState, setViewportState] = useState({
		offset: Vec.zero,
		zoom: 0,
	})

	const viewportScaleCoefficient = 1.3
	const viewportScale = viewportScaleCoefficient ** viewportState.zoom
	const viewportOffset = viewportState.offset

	const toMapPosition = (input: VecInput) =>
		Vec.from(input).minus(viewportOffset).dividedBy(viewportScale)

	const bindRootGestureHandlers = useGesture(
		{
			onDragStart: ({ event }) => {
				event.preventDefault()
			},
			onDrag: (event) => {
				setViewportState((state) => ({
					...state,
					offset: state.offset.plus(event.delta),
				}))
			},
			onDragEnd: () => {
				window.addEventListener(
					"contextmenu",
					(event) => event.preventDefault(),
					{ once: true },
				)
			},
			onContextMenu: ({ event }) => {
				event.preventDefault()
			},
			onWheel: (info) => {
				const delta = Vec.from(info.delta)
				if (delta.y === 0) return

				const zoomAmount = Math.round(delta.y / 100) * -1
				const pointerOffset = Vec.from(
					(info.event as unknown as React.WheelEvent).nativeEvent,
				).minus(viewportOffset)

				setViewportState((state) => {
					const nextViewportZoom = clamp(state.zoom + zoomAmount, -10, 10)
					const currentViewportScale = viewportScaleCoefficient ** state.zoom
					const nextViewportScale = viewportScaleCoefficient ** nextViewportZoom
					const scaleRatio = nextViewportScale / currentViewportScale

					return {
						...state,
						zoom: nextViewportZoom,
						offset: state.offset.plus(pointerOffset.times(1 - scaleRatio)),
					}
				})
			},
		},
		{
			drag: {
				pointer: {
					buttons: [MouseButtons.Secondary],
				},
			},
		},
	)

	return {
		viewportScale,
		viewportOffset,
		toMapPosition,
		bindRootGestureHandlers,
	}
}

function useTokens(scene: ApiScene) {
	const [selectedTokenIds, setSelectedTokenIds] = useState(
		readonly(new Set<Id<"characterTokens">>()),
	)
	const [tokenDragStart, setTokenDragStart] = useState(Vec.zero)
	const [tokenDragEnd, setTokenDragEnd] = useState(Vec.zero)
	const tokenDragOffset = tokenDragEnd.minus(tokenDragStart)

	const baseTokens = useQuery(api.tokens.list, { sceneId: scene._id }) ?? []
	const updateTokens = useAsyncQueue(useMutation(api.tokens.update))

	const pendingTokenUpdates = new Map<
		Id<"characterTokens">,
		Omit<Partial<ApiToken>, "characterId">
	>()

	for (const run of updateTokens.queue) {
		for (const { tokenId, characterId: _, ...rest } of run.args.updates) {
			pendingTokenUpdates.set(tokenId, {
				...pendingTokenUpdates.get(tokenId),
				...rest,
			})
		}
	}

	function getElementTokenId(element: HTMLElement) {
		const tokenId = element.dataset?.tokenId as
			| Id<"characterTokens">
			| undefined
		if (!tokenId) {
			throw new Error("missing tokenId")
		}
		return tokenId
	}

	const tokens = baseTokens
		.map((token) => ({
			...token,
			...omit(pendingTokenUpdates.get(token._id), ["tokenId", "characterId"]),
		}))
		.map((token) => ({
			...token,
			position: Vec.from(token.position)
				.roundTo(scene.cellSize / 4)
				.plus(selectedTokenIds.has(token._id) ? tokenDragOffset : 0),
		}))
		.sort((a, b) => a.updatedAt - b.updatedAt)

	const tokensById = keyBy(tokens, (t) => t._id)
	const selectedTokens = [...selectedTokenIds]
		.map((id) => tokensById.get(id))
		.filter(Boolean)

	return {
		tokens,
		selectedTokenIds,
		setSelectedTokenIds,
		tokenDragOffset,
		setTokenDragStart,
		setTokenDragEnd,
		updateTokens,
		selectedTokens,
		tokensById,
		getElementTokenId,
	}
}

function useSelection({
	transformPointerPosition,
	onSelectionChange,
	onContextMenu,
}: {
	transformPointerPosition: (input: Vec) => Vec
	onSelectionChange: (area: Rect) => void
	onContextMenu: (screenPosition: Vec) => void
}) {
	const [selecting, setSelecting] = useState(false)
	const [selectionStart, setSelectionStart] = useState(Vec.zero)
	const [selectionEnd, setSelectionEnd] = useState(Vec.zero)
	const selectionArea = Rect.bounds(selectionStart, selectionEnd)

	const bindSelectionHandlers = useGesture(
		{
			onPointerDown: () => {
				onSelectionChange(Rect.zero)
			},
			onDragStart: (info) => {
				if (info.buttons === MouseButtons.Primary) {
					setSelecting(true)
					setSelectionStart(Vec.from(info.xy))
					setSelectionEnd(Vec.from(info.xy))
				}
			},
			onDrag: (info) => {
				if (selecting) {
					const end = Vec.from(info.xy)
					setSelectionEnd(end)
					const mapArea = Rect.bounds(
						transformPointerPosition(selectionStart),
						transformPointerPosition(end),
					)
					onSelectionChange(mapArea)
				}
			},
			onDragEnd: (info) => {
				if ((info.event as PointerEvent).button === 0) {
					setSelecting(false)
				}
				if (
					(info.event as PointerEvent).button === 2 &&
					Vec.from(info.movement).length < 8
				) {
					onContextMenu(Vec.from(info.xy))
				}
			},
		},
		{
			drag: {
				pointer: {
					buttons: [MouseButtons.Primary, MouseButtons.Secondary],
				},
			},
		},
	)

	return {
		selecting,
		selectionArea,
		setSelecting,
		setSelectionStart,
		setSelectionEnd,
		bindSelectionHandlers,
	}
}
