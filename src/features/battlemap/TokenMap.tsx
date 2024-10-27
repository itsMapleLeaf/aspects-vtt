import { useQuery } from "convex/react"
import { clamp } from "lodash-es"
import { ReactNode, useRef, useState } from "react"
import { useEffectEvent } from "~/common/react/core.ts"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { useEventListener } from "~/lib/react.ts"
import { Vec } from "~/shared/vec.ts"
import { ApiCharacter } from "../characters/types.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { ApiScene } from "../scenes/types.ts"
import { ApiToken } from "./types.ts"

/** Corresponds to the `button` property on pointer events (**not** `buttons`) */
type PointerButton = (typeof PointerButton)[keyof typeof PointerButton]
const PointerButton = {
	left: 0,
	middle: 1,
	right: 2,
} as const

export function TokenMap({ scene }: { scene: ApiScene }) {
	const tokens = useQuery(api.tokens.list, { sceneId: scene._id }) ?? []
	const [selectedTokenIds, setSelectedTokenIds] = useState(
		new Set<Id<"characterTokens">>(),
	)

	const [pointerState, setPointerState] = useState({
		buttonLeft: "up" as "up" | "down" | "dragging",
		buttonRight: "up" as "up" | "down" | "dragging",
		dragStart: Vec.from(0),
		dragEnd: Vec.from(0),
		viewportOffset: Vec.from(0),
		viewportZoom: 0,
		selectionStart: Vec.from(0),
		selectionEnd: Vec.from(0),
	})

	const shouldPreventContextMenu = useRef(false)

	const viewportScaleCoefficient = 1.3
	const viewportScale = viewportScaleCoefficient ** pointerState.viewportZoom

	const draggingOffset =
		pointerState.buttonRight === "dragging"
			? pointerState.dragEnd.minus(pointerState.dragStart)
			: Vec.from(0)

	const viewportOffset = pointerState.viewportOffset.plus(draggingOffset)

	const selectionTopLeft = Vec.from([
		Math.min(pointerState.selectionStart.x, pointerState.selectionEnd.x),
		Math.min(pointerState.selectionStart.y, pointerState.selectionEnd.y),
	])

	const selectionBottomRight = Vec.from([
		Math.max(pointerState.selectionStart.x, pointerState.selectionEnd.x),
		Math.max(pointerState.selectionStart.y, pointerState.selectionEnd.y),
	])

	const selectionSize = Vec.from([
		selectionBottomRight.x - selectionTopLeft.x,
		selectionBottomRight.y - selectionTopLeft.y,
	])

	const onSelection = useEffectEvent(
		(rect: { x: number; y: number; width: number; height: number }): void => {
			setSelectedTokenIds(
				new Set(
					tokens
						.filter((it) => {
							const center = Vec.from(it.position).plus(scene.cellSize / 2)
							return (
								center.x >= rect.x &&
								center.x < rect.x + rect.width &&
								center.y >= rect.y &&
								center.y < rect.y + rect.height
							)
						})
						.map((it) => it._id),
				),
			)
		},
	)

	useEventListener(window, "pointermove", (event) => {
		setPointerState((state) => {
			if (state.buttonLeft === "down" || state.buttonLeft === "dragging") {
				return {
					...state,
					buttonLeft: "dragging",
					selectionEnd: Vec.from(event),
				}
			}
			if (state.buttonRight === "down" || state.buttonRight === "dragging") {
				return {
					...state,
					buttonRight: "dragging",
					dragEnd: Vec.from(event),
				}
			}
			return state
		})
		shouldPreventContextMenu.current = false
	})

	useEventListener(window, "pointerup", (event) => {
		if (
			event.button === PointerButton.left &&
			(pointerState.buttonLeft === "down" ||
				pointerState.buttonLeft === "dragging")
		) {
			setPointerState((state) => ({
				...state,
				buttonLeft: "up",
				selectionEnd: Vec.from(event),
			}))

			const width = selectionSize.x / viewportScale
			const height = selectionSize.y / viewportScale

			onSelection({
				...selectionTopLeft
					.minus(viewportOffset)
					.dividedBy(viewportScale)
					.toJSON(),
				width,
				height,
			})
		}

		if (
			event.button === PointerButton.right &&
			pointerState.buttonRight === "down"
		) {
			setPointerState((state) => ({ ...state, buttonRight: "up" }))
			shouldPreventContextMenu.current = true
		}

		if (
			event.button === PointerButton.right &&
			pointerState.buttonRight === "dragging"
		) {
			setPointerState((state) => ({
				...state,
				buttonRight: "up",
				viewportOffset: state.viewportOffset.plus(
					state.dragEnd.minus(state.dragStart),
				),
			}))
			shouldPreventContextMenu.current = true
		}
	})

	useEventListener(window, "blur", () => {
		if (
			pointerState.buttonRight === "down" ||
			pointerState.buttonRight === "dragging"
		) {
			setPointerState((state) => ({
				...state,
				buttonRight: "up",
				viewportOffset: state.viewportOffset.plus(
					state.dragEnd.minus(state.dragStart),
				),
			}))
		}
	})

	useEventListener(window, "contextmenu", (event) => {
		if (shouldPreventContextMenu.current) {
			event.preventDefault()
			shouldPreventContextMenu.current = false
		}
	})

	const handleRootPointerDown = (event: React.PointerEvent) => {
		if (event.button === PointerButton.right) {
			event.preventDefault()
			setPointerState((state) => ({
				...state,
				buttonRight: "down",
				dragStart: Vec.from(event.nativeEvent),
				dragEnd: Vec.from(event.nativeEvent),
			}))
		}
	}

	const handleSelectionInputPointerDown = (event: React.PointerEvent) => {
		if (event.button === PointerButton.left) {
			event.preventDefault()
			setPointerState((state) => ({
				...state,
				buttonLeft: "down",
				selectionStart: Vec.from(event.nativeEvent),
				selectionEnd: Vec.from(event.nativeEvent),
			}))
		}
	}

	const handleWheel = (event: React.WheelEvent) => {
		if (event.deltaY === 0) return

		const delta = Math.round(event.deltaY / 100) * -1
		const pointerOffset = Vec.from(event.nativeEvent).minus(viewportOffset)
		const nextViewportZoom = clamp(pointerState.viewportZoom + delta, -10, 10)

		const currentViewportScale =
			viewportScaleCoefficient ** pointerState.viewportZoom
		const nextViewportScale = viewportScaleCoefficient ** nextViewportZoom
		const scaleRatio = nextViewportScale / currentViewportScale

		setPointerState((state) => ({
			...state,
			viewportZoom: nextViewportZoom,
			viewportOffset: state.viewportOffset.plus(
				pointerOffset.times(1 - scaleRatio),
			),
		}))
	}

	return (
		<div
			className="absolute inset-0 overflow-clip"
			onPointerDown={handleRootPointerDown}
			onWheel={handleWheel}
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
							selected={selectedTokenIds.has(token._id)}
						/>
					) : null,
				)}
			</div>

			<div
				className="pointer-events-none rounded-sm border-2 border-accent-900 bg-accent-600/50 transition-opacity"
				style={{
					width: `${selectionSize.x}px`,
					height: `${selectionSize.y}px`,
					transform: `translate(${selectionTopLeft.toCSSPixels()})`,
					opacity: pointerState.buttonLeft === "dragging" ? 1 : 0,
					transitionDuration:
						pointerState.buttonLeft === "dragging" ? "0s" : undefined,
				}}
			/>
		</div>
	)
}

function CharacterTokenElement({
	token,
	character,
	scene,
	selected,
}: {
	token: ApiToken
	character: ApiCharacter
	scene: ApiScene
	selected: boolean
}) {
	return (
		<BaseTokenElement token={token} scene={scene}>
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
	children,
}: {
	token: ApiToken
	scene: ApiScene
	children: ReactNode
}) {
	return (
		<div
			key={token._id}
			className="absolute left-0 top-0 origin-top-left drop-shadow-md"
			style={{
				transform: `translate(${Vec.from(token.position).toCSSPixels()})`,
			}}
		>
			<div
				className="relative"
				style={{ width: scene.cellSize, height: scene.cellSize }}
			>
				{children}
			</div>
		</div>
	)
}
