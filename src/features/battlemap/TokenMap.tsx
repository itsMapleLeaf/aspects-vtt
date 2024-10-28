import { useMutation, useQuery } from "convex/react"
import { clamp } from "lodash-es"
import { ComponentProps, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { readonly, typed } from "~/lib/common.ts"
import { useEventListener } from "~/lib/react.ts"
import { Rect } from "~/lib/rect.ts"
import { Vec, VecInput } from "~/shared/vec.ts"
import { ApiCharacter } from "../characters/types.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { ApiScene } from "../scenes/types.ts"
import { ApiToken } from "./types.ts"

// left mouse
function isPrimaryButton(event: { button: number }) {
	return event.button === 0
}

// right mouse
function isSecondaryButton(event: { button: number }) {
	return event.button === 2
}

// mouse wheel
function isAuxButton(event: { button: number }) {
	return event.button === 1
}

export function TokenMap({ scene }: { scene: ApiScene }) {
	const updateTokens = useMutation(api.tokens.update)

	const initialState = {
		status: typed<
			"idle" | "draggingViewport" | "selectingArea" | "draggingTokens"
		>("idle"),
		dragStart: Vec.zero,
		dragEnd: Vec.zero,
		selectionStart: Vec.zero,
		selectionEnd: Vec.zero,
		tokenDragStart: Vec.zero,
		tokenDragEnd: Vec.zero,
		viewportOffset: Vec.zero,
		viewportZoom: 0,
		selectedTokenIds: readonly(new Set<Id<"characterTokens">>()),
		pendingTokens: readonly(
			new Map<Id<"characterTokens">, ApiToken & { position: Vec }>(),
		),
	}
	const [state, setState] = useState(initialState)

	const viewportDragOffset =
		// only apply offset while dragging
		state.status === "draggingViewport"
			? state.dragEnd.minus(state.dragStart)
			: Vec.zero

	const viewportScaleCoefficient = 1.3
	const viewportScale = viewportScaleCoefficient ** state.viewportZoom
	const viewportOffset = state.viewportOffset.plus(viewportDragOffset)

	const toMapPosition = (input: VecInput) =>
		Vec.from(input).minus(viewportScale).dividedBy(viewportScale)

	const selectionArea = Rect.bounds(state.selectionStart, state.selectionEnd)

	const tokenDragOffset =
		state.status === "draggingTokens"
			? toMapPosition(state.tokenDragEnd.minus(state.tokenDragStart))
			: Vec.zero

	const baseTokens = useQuery(api.tokens.list, { sceneId: scene._id }) ?? []
	const tokens = baseTokens.map((token) => ({
		...token,
		position: Vec.sum(
			state.pendingTokens.get(token._id)?.position ?? token.position,
			state.selectedTokenIds.has(token._id) ? tokenDragOffset : 0,
		),
	}))

	const tokensById = new Map(tokens.map((it) => [it._id, it]))

	const shouldPreventContextMenu = useRef(false)

	const handleRootPointerDown = (event: React.PointerEvent) => {
		setState((state) => {
			if (state.status === "idle" && isSecondaryButton(event)) {
				return {
					...state,
					status: "draggingViewport",
					dragStart: Vec.from(event.nativeEvent),
					dragEnd: Vec.from(event.nativeEvent),
				}
			}
			return state
		})
	}

	const handleSelectionInputPointerDown = (event: React.PointerEvent) => {
		setState((state) => {
			if (state.status === "idle" && isPrimaryButton(event)) {
				return {
					...state,
					status: "selectingArea",
					selectionStart: Vec.from(event.nativeEvent),
					selectionEnd: Vec.from(event.nativeEvent),
				}
			}
			return state
		})
	}

	const handleTokenPointerDown = (
		event: React.PointerEvent,
		token: ApiToken,
	) => {
		setState((state) => {
			if (state.status === "idle" && isPrimaryButton(event)) {
				return {
					...state,
					status: "draggingTokens",
					tokenDragStart: Vec.from(event.nativeEvent),
					tokenDragEnd: Vec.from(event.nativeEvent),
					selectedTokenIds: state.selectedTokenIds.has(token._id)
						? state.selectedTokenIds
						: new Set([token._id]),
				}
			}
			return state
		})
	}

	const handleRootWheel = (event: React.WheelEvent) => {
		if (event.deltaY === 0) return
		const delta = Math.round(event.deltaY / 100) * -1

		setState((state) => {
			const pointerOffset = Vec.from(event.nativeEvent).minus(viewportOffset)
			const nextViewportZoom = clamp(state.viewportZoom + delta, -10, 10)

			const currentViewportScale =
				viewportScaleCoefficient ** state.viewportZoom
			const nextViewportScale = viewportScaleCoefficient ** nextViewportZoom
			const scaleRatio = nextViewportScale / currentViewportScale

			return {
				...state,
				viewportZoom: nextViewportZoom,
				viewportOffset: state.viewportOffset.plus(
					pointerOffset.times(1 - scaleRatio),
				),
			}
		})
	}

	useEventListener(window, "pointermove", (event) => {
		setState((state) => {
			if (state.status === "selectingArea") {
				return { ...state, selectionEnd: Vec.from(event) }
			}
			if (state.status === "draggingViewport") {
				return { ...state, dragEnd: Vec.from(event) }
			}
			if (state.status === "draggingTokens") {
				return { ...state, tokenDragEnd: Vec.from(event) }
			}
			return state
		})
		shouldPreventContextMenu.current = false
	})

	useEventListener(window, "pointerup", (event) => {
		setState((state) => {
			if (state.status === "selectingArea" && isPrimaryButton(event)) {
				const mapArea = Rect.bounds(
					state.selectionStart.minus(viewportOffset).dividedBy(viewportScale),
					state.selectionEnd.minus(viewportOffset).dividedBy(viewportScale),
				)
				return {
					...state,
					status: "idle",
					selectedTokenIds: new Set(
						tokens
							.filter((it) => mapArea.intersects([it.position, scene.cellSize]))
							.map((it) => it._id),
					),
				}
			}

			if (state.status === "draggingViewport" && isSecondaryButton(event)) {
				return {
					...state,
					status: "idle",
					viewportOffset: state.viewportOffset.plus(
						state.dragEnd.minus(state.dragStart),
					),
				}
			}

			return state
		})

		if (state.status === "draggingViewport" && isSecondaryButton(event)) {
			shouldPreventContextMenu.current = true
		}

		if (state.status === "draggingTokens") {
			const pendingTokens = new Map(
				[...state.selectedTokenIds]
					.map((id) => tokensById.get(id))
					.filter(Boolean)
					.map((token) => [token._id, token]),
			)

			setState({
				...state,
				status: "idle",
				pendingTokens,
			})

			updateTokens({
				updates: [...pendingTokens.values()].map((token) => ({
					tokenId: token._id,
					position: token.position.toJSON(),
				})),
			}).finally(() => {
				setState((state) => {
					if (state.pendingTokens === pendingTokens) {
						return {
							...state,
							pendingTokens: readonly(new Map()),
						}
					}
					return state
				})
			})
		}
	})

	useEventListener(window, "blur", () => {
		setState((state) => {
			if (state.status === "selectingArea") {
				return { ...state, status: "idle" }
			}

			if (state.status === "draggingViewport") {
				return {
					...state,
					status: "idle",
					viewportOffset: state.viewportOffset.plus(
						state.dragEnd.minus(state.dragStart),
					),
				}
			}

			return state
		})
	})

	useEventListener(window, "contextmenu", (event) => {
		if (shouldPreventContextMenu.current) {
			event.preventDefault()
			shouldPreventContextMenu.current = false
		}
	})

	return (
		<div
			className="absolute inset-0 touch-none select-none overflow-clip"
			onPointerDown={handleRootPointerDown}
			onWheel={handleRootWheel}
		>
			<div
				className="pointer-events-none absolute inset-0 origin-top-left"
				style={{
					transform: `translate(${viewportOffset.toCSSPixels()}) scale(${viewportScale})`,
				}}
			>
				{scene.battlemapBackgroundId && (
					<img
						src={getImageUrl(scene.battlemapBackgroundId)}
						alt=""
						className="max-w-none"
						draggable={false}
					/>
				)}
			</div>

			<div
				className="absolute inset-0"
				onPointerDown={handleSelectionInputPointerDown}
			></div>

			<div
				className="pointer-events-children absolute inset-0 origin-top-left"
				style={{
					transform: `translate(${viewportOffset.toCSSPixels()}) scale(${viewportScale})`,
				}}
			>
				{tokens.map((token) =>
					token.characterId ? (
						<CharacterTokenElement
							key={token._id}
							token={token}
							character={token.character}
							scene={scene}
							selected={state.selectedTokenIds.has(token._id)}
							onPointerDown={(event) => {
								handleTokenPointerDown(event, token)
							}}
						/>
					) : null,
				)}
			</div>

			<div
				className="pointer-events-none rounded-sm border-2 border-accent-900 bg-accent-600/50 opacity-0 transition-opacity"
				style={{
					width: `${selectionArea.width}px`,
					height: `${selectionArea.height}px`,
					transform: `translate(${selectionArea.topLeft.toCSSPixels()})`,
					...(state.status === "selectingArea" && {
						opacity: 1,
						transitionDuration: "0",
					}),
				}}
			/>
		</div>
	)
}

function CharacterTokenElement({
	character,
	selected,
	children: _,
	...props
}: {
	character: ApiCharacter
	selected: boolean
} & ComponentProps<typeof BaseTokenElement>) {
	return (
		<BaseTokenElement {...props}>
			{character.imageId && (
				<img
					src={getImageUrl(character.imageId)}
					alt=""
					className="absolute inset-0 size-full rounded-full object-cover object-top"
					draggable={false}
				/>
			)}
			{selected && (
				<div className="absolute -inset-0.5 rounded-full border-2 border-accent-900 bg-accent-600/50 transition-opacity" />
			)}
		</BaseTokenElement>
	)
}

function BaseTokenElement({
	token,
	scene,
	...props
}: {
	token: ApiToken
	scene: ApiScene
} & ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"absolute left-0 top-0 origin-top-left drop-shadow-md",
				props.className,
			)}
			style={{
				transform: `translate(${Vec.from(token.position).toCSSPixels()})`,
				...props.style,
			}}
		>
			<div
				className="relative"
				style={{ width: scene.cellSize, height: scene.cellSize }}
			>
				{props.children}
			</div>
		</div>
	)
}
