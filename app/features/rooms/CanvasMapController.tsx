import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import { useState } from "react"
import * as React from "react"
import { Rect } from "#app/common/Rect.js"
import { createNonEmptyContext, useNonEmptyContext } from "#app/common/context.js"
import { applyOptimisticQueryUpdates } from "#app/common/convex.js"
import { useWindowEvent } from "#app/common/useWindowEvent.js"
import { Vector } from "#app/common/vector.js"
import { api } from "#convex/_generated/api.js"
import type { Branded } from "#convex/helpers.js"
import { useScene } from "../scenes/context.tsx"
import { Camera } from "./Camera.tsx"

type InputMode = "select" | "draw"

type TokenMenu = {
	position: Vector
	tokenKey: Branded<"token">
}

export type CanvasMapController = ReturnType<typeof useCanvasMapControllerProvider>

const MouseButtonLeft = 0
const MouseButtonMiddle = 1
const MouseButtonRight = 2

function useCanvasMapControllerProvider() {
	const scene = useScene()

	const [inputMode, setInputMode] = useState<InputMode>("select")
	const [camera, setCamera] = useState(new Camera())
	const [container, containerRef] = useState<HTMLElement | null>()
	const [selectedTokens, setSelectedTokens] = useState<ReadonlySet<Branded<"token">>>(
		new Set<Branded<"token">>(),
	)
	const [tokenDragStart, setTokenDragStart] = useState<Vector>()
	const [tokenDragEnd, setTokenDragEnd] = useState<Vector>()
	const pointer = usePointerPosition()

	const [previewAreaStart, setPreviewAreaStart] = useState<Vector>()

	const previewArea = (() => {
		if (inputMode === "draw" && previewAreaStart) {
			return Rect.fromCorners(previewAreaStart, pointer)
		}
		if (inputMode === "draw" && !previewAreaStart && scene) {
			return new Rect(pointer, Vector.from(1))
		}
	})()

	const addToken = useMutation(api.scenes.tokens.add)
	const updateToken = useMutation(api.scenes.tokens.update).withOptimisticUpdate((store, args) => {
		applyOptimisticQueryUpdates(store, api.scenes.tokens.list, (current) =>
			current.map((it) => (it.key === args.key ? { ...it, ...args } : it)),
		)
	})

	const inputModeHandlers = {
		select: {
			onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
				if (event.button === MouseButtonLeft) {
					const tokenKey = Iterator.from(document.elementsFromPoint(event.clientX, event.clientY))
						.filter((it) => it instanceof HTMLElement)
						.map((it) => it.dataset.tokenKey)
						.find((it) => it != null)

					if (tokenKey) {
						setSelectedTokens(new Set([tokenKey as Branded<"token">]))
						setTokenDragStart(Vector.from(event.clientX, event.clientY))
					} else {
						setSelectedTokens(new Set([]))
					}
				}
			},
			onPointerMove: (event: PointerEvent) => {
				if (tokenDragStart) {
					setTokenDragEnd(Vector.from(event.clientX, event.clientY))
				}
			},
			onPointerUp: (event: PointerEvent) => {
				if (event.button === MouseButtonLeft && scene && tokenDragStart && tokenDragEnd) {
					for (const key of selectedTokens) {
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
				setTokenDragStart(undefined)
				setTokenDragEnd(undefined)
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

	useWindowEvent("pointermove", (event) => {
		inputModeHandlers[inputMode].onPointerMove(event)
	})

	useWindowEvent("pointerup", (event) => {
		inputModeHandlers[inputMode].onPointerUp(event)
	})

	const toggleDrawInputMode = React.useCallback(() => {
		setInputMode((mode) => (mode === "draw" ? "select" : "draw"))
	}, [])

	function onPointerDown(event: React.PointerEvent<HTMLElement>) {
		const captured = captureDrag(event, MouseButtonRight, (event) => {
			setCamera((camera) => camera.movedBy(event.movementX, event.movementY))
		})
		if (captured) return

		inputModeHandlers[inputMode].onPointerDown(event)
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
		isSelectInput: inputMode === "select",
		isDrawInput: inputMode === "draw",
		toggleDrawInputMode,
		camera,
		previewArea,
		selectedTokens,
		tokenMovement: tokenDragEnd?.minus(tokenDragStart ?? tokenDragEnd),
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

function captureDrag(
	event: { button: number; preventDefault(): void },
	button: number,
	handleMove: (event: PointerEvent) => void,
	onFinish?: () => void,
) {
	if (event.button !== button) {
		return false
	}

	event.preventDefault()

	const handleContextMenu = (event: Event) => {
		event.preventDefault()
	}

	const handleUp = (event: PointerEvent | FocusEvent) => {
		const isUp = event instanceof FocusEvent || event.button === button
		if (!isUp) return

		event.preventDefault()
		onFinish?.()

		// delay to allow context menu handler to run
		setTimeout(() => {
			document.removeEventListener("pointermove", handleMove)
			document.removeEventListener("pointerup", handleUp)
			document.removeEventListener("pointercancel", handleUp)
			document.removeEventListener("blur", handleUp)
			document.removeEventListener("contextmenu", handleContextMenu)
		})
	}

	document.addEventListener("pointermove", handleMove)
	document.addEventListener("pointerup", handleUp)
	document.addEventListener("pointercancel", handleUp)
	document.addEventListener("blur", handleUp)
	document.addEventListener("contextmenu", handleContextMenu)

	return true
}

const CanvasMapControllerContext = createNonEmptyContext<CanvasMapController>()

export function CanvasMapControllerProvider({ children }: { children: React.ReactNode }) {
	return (
		<CanvasMapControllerContext.Provider value={useCanvasMapControllerProvider()}>
			{children}
		</CanvasMapControllerContext.Provider>
	)
}

export function useCanvasMapController() {
	return useNonEmptyContext(CanvasMapControllerContext)
}