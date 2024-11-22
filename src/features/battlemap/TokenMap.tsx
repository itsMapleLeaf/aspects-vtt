import { FullGestureState, useGesture } from "@use-gesture/react"
import { useMutation, useQuery } from "convex/react"
import { clamp } from "es-toolkit"
import { useState } from "react"
import * as v from "valibot"
import { ApiImage } from "~/components/ApiImage.tsx"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { Sprite } from "~/features/battlemap/Sprite.tsx"
import { readonly } from "~/lib/common.ts"
import { MouseButtons } from "~/lib/dom.ts"
import { groupBy, keyBy } from "~/lib/iterable.ts"
import { useKeyDown } from "~/lib/keyboard.ts"
import { useLocalStorage } from "~/lib/react/dom.ts"
import { Rect } from "~/lib/rect.ts"
import { useAsyncQueue } from "~/lib/useAsyncQueue.ts"
import { Vec, VecInput } from "~/lib/vec.ts"
import { useCharacterEditorDialog } from "../characters/CharacterEditorDialog.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { ApiScene } from "../scenes/types.ts"
import { ActivityTokenElement } from "./ActivityTokenElement.tsx"
import { BaseTokenElement } from "./BaseTokenElement.tsx"
import { CharacterTokenAnnotations } from "./CharacterTokenAnnotations.tsx"
import { CharacterTokenElement } from "./CharacterTokenElement.tsx"
import { PingLayer } from "./PingLayer.tsx"
import { useTokenMenu } from "./TokenMenu.tsx"
import { ApiToken } from "./types.ts"
import { useMapBackdropMenu } from "./useMapBackdropMenu.tsx"

export function TokenMap({ scene }: { scene: ApiScene }) {
	const room = useRoomContext()
	const viewport = useViewport(scene)
	const tokenState = useTokens(scene)
	const tokenMenu = useTokenMenu()
	const characterEditor = useCharacterEditorDialog()
	const [inputMode, setInputMode] = useState<"default" | "area">("default")
	const [newAreaStart, setNewAreaStart] = useState(Vec.zero)
	const [newAreaEnd, setNewAreaEnd] = useState(Vec.zero)
	const createTokens = useMutation(api.tokens.create)

	const newAreaBaseRect = Rect.bounds(newAreaStart, newAreaEnd)

	const newAreaMapRect = Rect.bounds(
		viewport.toMapPosition(newAreaBaseRect.topLeft).floorTo(scene.cellSize),
		viewport.toMapPosition(newAreaBaseRect.bottomRight).ceilTo(scene.cellSize),
	)

	const newAreaScreenRect = Rect.bounds(
		newAreaMapRect.topLeft
			.times(viewport.viewportScale)
			.plus(viewport.viewportOffset),
		newAreaMapRect.bottomRight
			.times(viewport.viewportScale)
			.plus(viewport.viewportOffset),
	)

	const viewportMenu = useMapBackdropMenu({
		onAddArea(event) {
			setInputMode("area")
			setNewAreaStart(Vec.from(event.nativeEvent))
			setNewAreaEnd(Vec.from(event.nativeEvent))
		},
	})

	const tokenGroups = groupBy(
		tokenState.tokens,
		(token) => token.type ?? (token.characterId ? "character" : "activity"),
	)

	const selection = useSelection({
		transformPointerPosition: viewport.toMapPosition,
		onSelectionChange: (area) => {
			const selectedIds = new Set(
				tokenState.tokens
					.filter((it) => area.intersects([it.position, it.size]))
					.map((it) => it._id),
			)
			tokenState.setSelectedTokenIds(selectedIds)
		},
		onContextMenu: (screenPosition) => {
			viewportMenu.show(screenPosition, viewport.toMapPosition(screenPosition))
		},
	})

	/**
	 * "peeking" status means it's being temporarily shown on all tokens without
	 * needing to hover over
	 */
	const peekingStatus = useKeyDown("Alt")

	const areAnnotationsVisible = (token: ApiToken) =>
		!selection.selecting &&
		tokenState.tokenDragOffset.equals(Vec.zero) &&
		(visibleTokenAnnotations.get(token._id) ||
			tokenState.selectedTokenIds.has(token._id))

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
					tokenMenu.show(
						{ x: event.clientX, y: event.clientY },
						tokenState.selectedTokenIds,
					)
				} else {
					tokenState.setSelectedTokenIds(new Set([tokenId]))
					tokenMenu.show(
						{ x: event.clientX, y: event.clientY },
						new Set([tokenId]),
					)
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

	const me = useQuery(api.users.me)
	const createPing = useMutation(api.pings.create).withOptimisticUpdate(
		(store, { roomId, position, key }) => {
			if (!me) return
			store.setQuery(api.pings.list, { roomId }, [
				...(store.getQuery(api.pings.list, { roomId }) ?? []),
				{
					_id: crypto.randomUUID() as Id<"pings">,
					_creationTime: Date.now(),
					user: { _id: me._id, name: me.name },
					userId: me._id,
					roomId,
					position,
					key,
				},
			])
		},
	)

	const bindRootGestureHandlers = useGesture(
		{
			onDragStart: (info) => {
				if (info.buttons !== MouseButtons.Secondary) {
					info.cancel()
				}
			},
			onDrag: (info) => {
				if (info.buttons === MouseButtons.Secondary) {
					viewport.handleDrag(info)
				}
			},
			onDragEnd: (info) => {
				if (info.buttons === MouseButtons.Secondary) {
					window.addEventListener(
						"contextmenu",
						(event) => event.preventDefault(),
						{ once: true },
					)
				}
			},
			onContextMenu: ({ event }) => {
				event.preventDefault()
			},
			onWheel: (info) => {
				info.event.preventDefault()
				viewport.handleWheel(info)
			},
			onPointerDown: (info) => {
				if (info.buttons === MouseButtons.Middle) {
					createPing({
						roomId: room._id,
						position: viewport
							.toMapPosition({
								x: info.event.clientX,
								y: info.event.clientY,
							})
							.toJSON(),
						key: crypto.randomUUID(),
					})
					info.event.preventDefault()
				}

				// ghetto long press
				if (
					info.buttons === MouseButtons.Primary ||
					info.buttons === MouseButtons.Middle
				) {
					const controller = new AbortController()
					const signal = controller.signal
					let moved = Vec.zero

					const timeout = setTimeout(() => {
						createPing({
							roomId: room._id,
							position: viewport
								.toMapPosition({
									x: info.event.clientX,
									y: info.event.clientY,
								})
								.toJSON(),
							key: crypto.randomUUID(),
						})
						controller.abort()
					}, 400)

					controller.signal.addEventListener("abort", () => {
						clearTimeout(timeout)
					})

					window.addEventListener(
						"pointermove",
						(event) => {
							moved = moved.plus(Vec.from(event).length)
							if (moved.length > 8) {
								controller.abort()
							}
						},
						{ signal },
					)

					window.addEventListener(
						"pointerup",
						() => {
							controller.abort()
						},
						{ signal },
					)
				}
			},
		},
		{
			drag: {
				pointer: {
					buttons: [
						MouseButtons.Primary,
						MouseButtons.Secondary,
						MouseButtons.Middle,
					],
				},
			},
			wheel: {
				eventOptions: {
					passive: false,
				},
			},
		},
	)

	const bindAreaGestureHandlers = useGesture({
		onPointerMove({ pressed, event }) {
			if (!pressed) {
				setNewAreaStart(Vec.of(event.clientX, event.clientY))
				setNewAreaEnd(Vec.of(event.clientX, event.clientY))
			}
		},
		onDragStart({ xy }) {
			setNewAreaStart(Vec.from(xy))
			setNewAreaEnd(Vec.from(xy))
		},
		onDrag({ xy }) {
			setNewAreaEnd(Vec.from(xy))
		},
		onDragEnd() {
			setInputMode("default")
			createTokens({
				inputs: [
					{
						type: "area",
						position: newAreaMapRect.topLeft.toJSON(),
						size: newAreaMapRect.size.toJSON(),
						sceneId: scene._id,
					},
				],
			})
		},
	})

	return (
		<>
			{viewportMenu.element}
			{characterEditor.element}
			{tokenMenu.element}
			<div
				{...bindRootGestureHandlers()}
				className="absolute inset-0 touch-none select-none overflow-clip"
			>
				<div
					className="absolute inset-0 transition data-[input-mode=area]:brightness-50"
					data-input-mode={inputMode}
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
						{tokenGroups.get("area")?.map((token) => (
							<BaseTokenElement
								{...bindTokenGestureHandlers()}
								key={token._id}
								token={token}
								scene={scene}
							>
								<div className="absolute inset-0 flex items-center justify-center rounded-sm border border-blue-700 bg-blue-400/50">
									<p className="rounded-lg bg-black/50 px-3 py-2 text-[50px] font-medium tabular-nums text-blue-200">
										{Math.round(
											(token.size?.x ?? scene.cellSize) / scene.cellSize,
										)}
										x
										{Math.round(
											(token.size?.y ?? scene.cellSize) / scene.cellSize,
										)}
									</p>
								</div>
								{tokenState.selectedTokenIds.has(token._id) && (
									<div className="pointer-events-none absolute -inset-1 border-2 border-accent-900 bg-accent-600/50 transition-opacity" />
								)}
							</BaseTokenElement>
						))}
						{tokenGroups.get("character")?.map((token) => {
							if (!token.character) return
							return (
								<CharacterTokenElement
									{...bindTokenGestureHandlers()}
									key={token._id}
									token={token}
									character={token.character}
									scene={scene}
									selected={tokenState.selectedTokenIds.has(token._id)}
									pointerEvents
								/>
							)
						})}
						{tokenGroups.get("activity")?.map((token) => (
							<ActivityTokenElement
								key={token._id}
								token={token}
								scene={scene}
								selected={tokenState.selectedTokenIds.has(token._id)}
								pointerEvents
								{...bindTokenGestureHandlers()}
								onContextMenu={(event) => {
									const position = { x: event.clientX, y: event.clientY }
									if (tokenState.selectedTokenIds.has(token._id)) {
										tokenMenu.show(position, tokenState.selectedTokenIds)
									} else {
										tokenState.setSelectedTokenIds(new Set([token._id]))
										tokenMenu.show(position, new Set([token._id]))
									}
								}}
							/>
						))}
					</Sprite>

					<PingLayer
						position={viewport.viewportOffset}
						viewportScale={viewport.viewportScale}
					/>

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
						{tokenGroups.get("character")?.map((token) => {
							if (!token.character) return
							return (
								<CharacterTokenAnnotations
									key={token._id}
									position={Vec.from(token.position).times(
										viewport.viewportScale,
									)}
									size={Vec.from(token.size).times(viewport.viewportScale)}
									character={token.character}
									visible={areAnnotationsVisible(token)}
									statusVisible={peekingStatus}
									distanceMoved={
										tokenState.selectedTokenIds.has(token._id)
											? tokenState.tokenDragOffset.dividedBy(scene.cellSize)
													.manhattanLength
											: 0
									}
								/>
							)
						})}
					</Sprite>
				</div>
				<div
					{...bindAreaGestureHandlers()}
					className="pointer-events-none absolute inset-0 touch-none opacity-0 transition data-[input-mode=area]:pointer-events-auto data-[input-mode=area]:opacity-100"
					data-input-mode={inputMode}
				>
					<div
						className="absolute left-0 top-0 flex items-center justify-center rounded-sm border border-blue-700 bg-blue-400/50"
						style={{
							transform: `translate(${newAreaScreenRect.topLeft.toCSSPixels()})`,
							width: newAreaScreenRect.width,
							height: newAreaScreenRect.height,
						}}
					>
						<p className="rounded-lg bg-black/50 px-3 py-2 text-lg font-medium tabular-nums text-blue-200">
							{Math.round(newAreaMapRect.width / scene.cellSize)}x
							{Math.round(newAreaMapRect.height / scene.cellSize)}
						</p>
					</div>
				</div>
			</div>
		</>
	)
}

function useViewport(scene: ApiScene) {
	const [viewportState, setViewportState] = useLocalStorage(
		`tokenMap:viewportState:${scene._id}`,
		{
			offset: Vec.zero,
			zoom: 0,
		},
		v.parser(
			v.object({
				offset: v.pipe(
					v.object({ x: v.number(), y: v.number() }),
					v.transform((input) => Vec.from(input)),
				),
				zoom: v.number(),
			}),
		),
	)

	const viewportScaleCoefficient = 1.3
	const viewportScale = viewportScaleCoefficient ** viewportState.zoom
	const viewportOffset = viewportState.offset.roundTo(1)

	const handleDrag = (info: FullGestureState<"drag">) => {
		setViewportState((state) => ({
			...state,
			offset: state.offset.plus(info.delta),
		}))
	}

	const handleWheel = (info: FullGestureState<"wheel">) => {
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
	}

	const toMapPosition = (input: VecInput) =>
		Vec.from(input).minus(viewportOffset).dividedBy(viewportScale)

	return {
		viewportScale,
		viewportOffset,
		toMapPosition,
		handleDrag,
		handleWheel,
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
			...pendingTokenUpdates.get(token._id),
		}))
		.map((token) => ({
			...token,
			position: Vec.from(token.position)
				.roundTo(token.type === "area" ? scene.cellSize : scene.cellSize / 4)
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
			onPointerDown: (info) => {
				if (info.buttons === MouseButtons.Primary) {
					onSelectionChange(Rect.zero)
				}
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
