import { useMutation, useQuery } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import { useState } from "react"
import * as React from "react"
import { Rect } from "../../common/Rect.ts"
import { createNonEmptyContext, useNonEmptyContext } from "../../common/context.tsx"
import { applyOptimisticQueryUpdates } from "../../common/convex.ts"
import { expect } from "../../common/expect.ts"
import type { Nullish } from "../../common/types.ts"
import { useWindowEvent } from "../../common/useWindowEvent.ts"
import { Vector } from "../../common/vector.ts"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import type { Branded } from "../../../convex/helpers.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { Camera } from "./Camera.ts"
import type { ApiScene } from "./types.ts"

type InputMode = "select" | "draw"

type TokenMenu = {
	tokenKey: Branded<"token">
	screenPosition: Vector
}

export type SceneContextType = ReturnType<typeof useSceneProvider>

const MouseButtonLeft = 0
const MouseButtonMiddle = 1
const MouseButtonRight = 2

function useSceneProvider(scene: Nullish<ApiScene>) {
	const tokens = useQuery(api.scenes.tokens.list, scene ? { sceneId: scene._id } : "skip")
	const pointer = usePointerPosition()

	const [inputMode, setInputMode] = useState<InputMode>("select")
	const [camera, setCamera] = useState(new Camera())
	const [container, containerRef] = useState<HTMLElement | null>()
	const [selectedTokenIds, setSelectedTokenIds] = useState<ReadonlySet<Branded<"token">>>(
		new Set<Branded<"token">>(),
	)
	const [tokenDragStart, setTokenDragStart] = useState<Vector>()
	const [tokenDragEnd, setTokenDragEnd] = useState<Vector>()
	const [previewAreaStart, setPreviewAreaStart] = useState<Vector>()
	const [tokenMenu, setTokenMenu] = useState<TokenMenu>()
	const [draggingViewport, setDraggingViewport] = useState<"init" | "dragging">()
	const [multiSelectStart, setMultiSelectStart] = useState<Vector>()

	const addToken = useMutation(api.scenes.tokens.add)
	const updateToken = useMutation(api.scenes.tokens.update).withOptimisticUpdate((store, args) => {
		applyOptimisticQueryUpdates(store, api.scenes.tokens.list, (current) =>
			current.map((it) => (it.key === args.key ? { ...it, ...args } : it)),
		)
	})

	const selectedTokens = () =>
		Iterator.from(tokens ?? []).filter((it) => selectedTokenIds.has(it.key))

	const selectedCharacters = () =>
		selectedTokens()
			.map((it) => it.character)
			.filter((it) => it != null)

	const previewArea = (() => {
		if (inputMode === "draw" && previewAreaStart) {
			return Rect.fromCorners(previewAreaStart, pointer)
		}
		if (inputMode === "draw" && !previewAreaStart) {
			return new Rect(pointer, Vector.from(1))
		}
	})()

	const getMultiSelectArea = () => multiSelectStart && Rect.fromCorners(multiSelectStart, pointer)

	const inputModeHandlers = {
		select: {
			onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
				if (event.button === MouseButtonLeft && container?.contains(event.target as Node)) {
					const cursorPosition = vectorFromEventClientPosition(event)
					const tokenKey = findTokenElementsAtPoint(cursorPosition).take(1).toArray()[0]

					if (!tokenKey) {
						setSelectedTokenIds(new Set([]))
						setMultiSelectStart(cursorPosition)
					}

					if (tokenKey && selectedTokenIds.has(tokenKey)) {
						setTokenDragStart(cursorPosition)
					}

					if (tokenKey && !selectedTokenIds.has(tokenKey)) {
						setSelectedTokenIds(new Set([tokenKey]))
						setTokenDragStart(cursorPosition)
					}
				}
			},
			onPointerMove: (event: PointerEvent) => {
				if (tokenDragStart) {
					event.preventDefault()
					setTokenDragEnd(vectorFromEventClientPosition(event))
				}
				const multiSelectArea = getMultiSelectArea()
				if (multiSelectArea) {
					event.preventDefault()

					const overlappingTokenKeys = Iterator.from(document.querySelectorAll("[data-token-key]"))
						.filter((it) => it instanceof HTMLElement)
						.filter((element) =>
							Rect.from(element.getBoundingClientRect()).overlaps(multiSelectArea),
						)
						.map((element) =>
							expect(element.dataset.tokenKey, "element.dataset.tokenKey is undefined"),
						)
						.map((it) => it as Branded<"token">)
					setSelectedTokenIds(new Set(overlappingTokenKeys))
				}
			},
			onPointerUp: (event: PointerEvent) => {
				if (event.button === MouseButtonLeft) {
					setTokenDragStart(undefined)
					setTokenDragEnd(undefined)
					setMultiSelectStart(undefined)

					if (tokenDragStart && tokenDragEnd && scene) {
						for (const key of selectedTokenIds) {
							const existing = scene.tokens?.find((it) => it.key === key)
							updateToken({
								key,
								sceneId: scene._id,
								position: Vector.from(existing?.position ?? Vector.zero)
									.plus(tokenDragEnd.minus(tokenDragStart).dividedBy(camera.scale))
									.roundedTo(scene.cellSize).xy,
							})
						}
					}
				}

				if (event.button === MouseButtonRight && container?.contains(event.target as Node)) {
					const cursor = vectorFromEventClientPosition(event)
					const tokenKey = findTokenElementsAtPoint(cursor).take(1).toArray()[0]
					if (tokenKey) {
						// run after other pointer up events which cause this to close
						setTimeout(() => {
							setTokenMenu({
								tokenKey,
								screenPosition: cursor,
							})
							if (!selectedTokenIds.has(tokenKey)) {
								setSelectedTokenIds(new Set([tokenKey]))
							}
						})
					}
				}
			},
		},
		draw: {
			onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
				if (event.button === MouseButtonLeft) {
					setPreviewAreaStart(pointer)
					return
				}
			},
			onPointerMove: (event: PointerEvent) => {},
			onPointerUp: async (event: PointerEvent) => {
				if (event.button === MouseButtonLeft && previewArea && scene) {
					const worldRect = Rect.fromCorners(
						camera.viewportToWorld(previewArea.topLeft).floorTo(scene.cellSize),
						camera.viewportToWorld(previewArea.bottomRight).ceilingTo(scene.cellSize),
					)
					addToken({
						sceneId: scene._id,
						position: worldRect.position.xy,
						visible: true,
						area: {
							width: worldRect.width,
							height: worldRect.height,
							color: "blue",
						},
					}).catch((error) => {
						alert("Failed to create area. Check the console for details.")
						console.error(error)
					})
					setPreviewAreaStart(undefined)
				}
			},
		},
	}

	function onPointerDown(event: React.PointerEvent<HTMLElement>) {
		if (event.button === MouseButtonRight) {
			setDraggingViewport("init")
			return
		}

		inputModeHandlers[inputMode].onPointerDown(event)
	}

	useWindowEvent("pointermove", (event) => {
		if (draggingViewport) {
			setDraggingViewport("dragging")
			setCamera((camera) => camera.movedBy(event.movementX, event.movementY))
			return
		}

		inputModeHandlers[inputMode].onPointerMove(event)
	})

	useWindowEvent("pointerup", (event) => {
		setDraggingViewport(undefined)
		if (event.button === MouseButtonRight && draggingViewport === "dragging") {
			return
		}
		inputModeHandlers[inputMode].onPointerUp(event)
	})

	const toggleDrawInputMode = React.useCallback(() => {
		setInputMode((mode) => (mode === "draw" ? "select" : "draw"))
	}, [])

	function findTokenElementsAtPoint(point: Vector) {
		return Iterator.from(document.elementsFromPoint(point.x, point.y))
			.filter((it) => it instanceof HTMLElement)
			.map((it) => it.dataset.tokenKey)
			.filter((it): it is Branded<"token"> => it != null)
	}

	function vectorFromEventClientPosition(event: { clientX: number; clientY: number }) {
		return Vector.from(event.clientX, event.clientY)
	}

	function onWheel(event: React.WheelEvent<HTMLDivElement>) {
		const delta = Math.sign(event.deltaY)
		if (delta === 0) return

		const rect = container?.getBoundingClientRect()

		const pivot = Vector.from(event.clientX, event.clientY)
			.minus(rect?.left ?? 0, rect?.top ?? 0)
			.minus(camera.position)

		setCamera((camera) => camera.zoomedBy(delta * -1, pivot))
	}

	return {
		scene,
		isSelectInput: inputMode === "select",
		isDrawInput: inputMode === "draw",
		toggleDrawInputMode,
		camera,
		previewArea,
		selectedTokens,
		selectedCharacters,
		selectCharacter(id: Id<"characters">) {
			for (const token of tokens ?? []) {
				if (token.character?._id === id) {
					setSelectedTokenIds(new Set([token.key]))
				}
			}
		},
		tokenMovement: tokenDragEnd?.minus(tokenDragStart ?? tokenDragEnd),
		tokenMenu,
		getMultiSelectArea,
		closeTokenMenu() {
			setTokenMenu(undefined)
		},
		containerProps: {
			ref: containerRef,
			onPointerDown,
			onWheel,
		},
	}
}

function usePointerPosition() {
	const [position, setPosition] = useState(Vector.zero)

	useWindowEvent("pointermove", (event) => {
		setPosition(Vector.from(event.clientX, event.clientY))
	})

	return position
}

const SceneContext = createNonEmptyContext<SceneContextType>()

export function SceneProvider({ children }: { children: React.ReactNode }) {
	const room = useRoom()
	const scene = useQuery(api.scenes.getCurrent, { roomId: room._id })
	const context = useSceneProvider(scene)
	return <SceneContext value={context}>{children}</SceneContext>
}

export function useSceneContext() {
	return useNonEmptyContext(SceneContext)
}

export function useScene() {
	return useSceneContext().scene
}
