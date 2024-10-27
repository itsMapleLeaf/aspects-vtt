import { useQuery } from "convex/react"
import { clamp } from "lodash-es"
import { atom, computed } from "nanostores"
import { ReactNode, useEffect, useState } from "react"
import { useLatestRef } from "~/common/react/core.ts"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { Vec } from "~/shared/vec.ts"
import { ApiCharacter } from "../characters/types.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { ApiScene } from "../scenes/types.ts"
import { ApiToken } from "./types.ts"

export function TokenMap({ scene }: { scene: ApiScene }) {
	const tokens = useQuery(api.tokens.list, { sceneId: scene._id }) ?? []
	const [selectedTokenIds, setSelectedTokenIds] = useState(
		new Set<Id<"characterTokens">>(),
	)

	return (
		<TokenMapViewport
			onSelection={(rect) => {
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
		</TokenMapViewport>
	)
}

/** Corresponds to the `button` property on pointer events (**not** `buttons`) */
type PointerButton = (typeof PointerButton)[keyof typeof PointerButton]
const PointerButton = {
	left: 0,
	middle: 1,
	right: 2,
} as const

function TokenMapViewport({
	children,
	onSelection,
}: {
	children: ReactNode
	onSelection: (rect: {
		x: number
		y: number
		width: number
		height: number
	}) => void
}) {
	const onSelectRef = useLatestRef(onSelection)

	const [controller] = useState(function createTokenMapController() {
		const pointerButtonLeft = atom<"up" | "down" | "dragging">("up")
		const pointerButtonRight = atom<"up" | "down" | "dragging">("up")

		const viewportDragStart = atom(Vec.from(0))
		const viewportDragEnd = atom(Vec.from(0))

		const viewportOffsetBase = atom(Vec.from(0))
		const viewportZoom = atom(0)

		const selectionStart = atom(Vec.from(0))
		const selectionEnd = atom(Vec.from(0))

		let shouldPreventContextMenu = false

		const draggingOffset = computed(
			[pointerButtonRight, viewportDragStart, viewportDragEnd],
			(pointerButtonRight, pointerStart, pointerEnd) =>
				pointerButtonRight === "dragging"
					? pointerEnd.minus(pointerStart)
					: Vec.from(0),
		)

		const viewportOffset = computed(
			[viewportOffsetBase, draggingOffset],
			(viewportOffsetBase, draggingOffset) =>
				viewportOffsetBase.plus(draggingOffset),
		)

		const viewportScaleCoefficient = 1.3
		const viewportScale = computed(
			[viewportZoom],
			(viewportZoom) => viewportScaleCoefficient ** viewportZoom,
		)

		const viewportTransform = computed(
			[viewportOffset, viewportScale],
			(offset, scale) => `translate(${offset.toCSSPixels()}) scale(${scale})`,
		)

		const selectionTopLeft = computed(
			[selectionStart, selectionEnd],
			(selectionStart, selectionEnd) =>
				Vec.from([
					Math.min(selectionStart.x, selectionEnd.x),
					Math.min(selectionStart.y, selectionEnd.y),
				]),
		)

		const selectionBottomRight = computed(
			[selectionStart, selectionEnd],
			(selectionStart, selectionEnd) =>
				Vec.from([
					Math.max(selectionStart.x, selectionEnd.x),
					Math.max(selectionStart.y, selectionEnd.y),
				]),
		)

		const selectionSize = computed(
			[selectionTopLeft, selectionBottomRight],
			(selectionTopLeft, selectionBottomRight) =>
				Vec.from([
					selectionBottomRight.x - selectionTopLeft.x,
					selectionBottomRight.y - selectionTopLeft.y,
				]),
		)

		const selectionStyle = computed(
			[selectionTopLeft, selectionSize],
			(selectionTopLeft, selectionSize) => ({
				width: `${selectionSize.x}px`,
				height: `${selectionSize.y}px`,
				transform: `translate(${selectionTopLeft.toCSSPixels()})`,
				opacity: pointerButtonLeft.get() === "dragging" ? "1" : "0",
				transitionDuration:
					pointerButtonLeft.get() === "dragging" ? "0" : undefined,
			}),
		)

		function bindRootListeners(element: HTMLElement) {
			const controller = new AbortController()

			element.addEventListener(
				"pointerdown",
				(event) => {
					if (event.button === PointerButton.left) {
						event.preventDefault()
						pointerButtonLeft.set("down")
						selectionStart.set(Vec.from(event))
						selectionEnd.set(Vec.from(event))
					}
					if (event.button === PointerButton.right) {
						event.preventDefault()
						pointerButtonRight.set("down")
						viewportDragStart.set(Vec.from(event))
						viewportDragEnd.set(Vec.from(event))
					}
				},
				{ signal: controller.signal },
			)

			element.addEventListener(
				"wheel",
				(event) => {
					if (event.deltaY === 0) return

					const delta = Math.round(event.deltaY / 100) * -1

					const currentZoom = viewportZoom.get()
					const currentOffset = viewportOffset.get()

					const pointerOffset = Vec.from(event).minus(currentOffset)
					const nextViewportZoom = clamp(currentZoom + delta, -10, 10)

					const currentViewportScale = viewportScaleCoefficient ** currentZoom
					const nextViewportScale = viewportScaleCoefficient ** nextViewportZoom
					const scaleRatio = nextViewportScale / currentViewportScale

					viewportOffsetBase.set(
						viewportOffsetBase.get().plus(pointerOffset.times(1 - scaleRatio)),
					)
					viewportZoom.set(nextViewportZoom)
				},
				{ signal: controller.signal, passive: false },
			)

			return () => {
				controller.abort()
			}
		}

		function bindWindowListeners() {
			const controller = new AbortController()

			window.addEventListener(
				"pointermove",
				(event) => {
					if (
						pointerButtonLeft.get() === "down" ||
						pointerButtonLeft.get() === "dragging"
					) {
						pointerButtonLeft.set("dragging")
						selectionEnd.set(Vec.from(event))
					}

					if (
						pointerButtonRight.get() === "down" ||
						pointerButtonRight.get() === "dragging"
					) {
						pointerButtonRight.set("dragging")
						viewportDragEnd.set(Vec.from(event))
					}

					shouldPreventContextMenu = false
				},
				{ signal: controller.signal },
			)

			window.addEventListener(
				"pointerup",
				(event) => {
					if (
						event.button === PointerButton.left &&
						(pointerButtonLeft.get() === "down" ||
							pointerButtonLeft.get() === "dragging")
					) {
						pointerButtonLeft.set("up")
						selectionEnd.set(Vec.from(event))

						const { x: width, y: height } = selectionSize
							.get()
							.dividedBy(viewportScale.get())

						const rect = {
							...selectionTopLeft
								.get()
								.minus(viewportOffset.get())
								.dividedBy(viewportScale.get())
								.toJSON(),
							width,
							height,
						}
						onSelectRef.current(rect)
					}

					if (
						event.button === PointerButton.right &&
						pointerButtonRight.get() === "down"
					) {
						pointerButtonRight.set("up")
						shouldPreventContextMenu = true
					}

					if (
						event.button === PointerButton.right &&
						pointerButtonRight.get() === "dragging"
					) {
						pointerButtonRight.set("up")
						viewportOffsetBase.set(
							viewportOffsetBase
								.get()
								.plus(viewportDragEnd.get().minus(viewportDragStart.get())),
						)
						shouldPreventContextMenu = true
					}
				},
				{ signal: controller.signal },
			)

			window.addEventListener(
				"blur",
				(event) => {
					if (pointerButtonRight.get() === "down") {
						event.preventDefault()
						pointerButtonRight.set("up")
						viewportOffsetBase.set(
							viewportOffsetBase
								.get()
								.plus(viewportDragEnd.get().minus(viewportDragStart.get())),
						)
					}
					if (pointerButtonRight.get() === "dragging") {
						event.preventDefault()
						pointerButtonRight.set("up")
						viewportOffsetBase.set(
							viewportOffsetBase
								.get()
								.plus(viewportDragEnd.get().minus(viewportDragStart.get())),
						)
					}
				},
				{ signal: controller.signal },
			)

			window.addEventListener(
				"contextmenu",
				(event) => {
					if (shouldPreventContextMenu) {
						event.preventDefault()
						shouldPreventContextMenu = false
					}
				},
				{ signal: controller.signal },
			)

			return () => {
				controller.abort()
			}
		}

		return {
			bindRootListeners,
			bindWindowListeners,
			viewportTransform,
			selectionStyle,
		}
	})

	useEffect(() => controller.bindWindowListeners(), [controller])

	return (
		<div
			className="absolute inset-0 overflow-clip"
			ref={(element) => {
				if (element) return controller.bindRootListeners(element)
			}}
		>
			<div
				className="absolute inset-0 origin-top-left"
				ref={(element) => {
					if (!element) return
					return controller.viewportTransform.subscribe((transform) => {
						element.style.transform = transform
					})
				}}
			>
				{children}
			</div>
			<div
				className="rounded-sm border-2 border-accent-900 bg-accent-600/50 transition-opacity"
				ref={(element) => {
					if (!element) return
					return controller.selectionStyle.subscribe(
						({ width, height, transform, opacity, transitionDuration }) => {
							element.style.width = width
							element.style.height = height
							element.style.transform = transform
							element.style.opacity = opacity
							element.style.transitionDuration = transitionDuration ?? ""
						},
					)
				}}
			></div>
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
