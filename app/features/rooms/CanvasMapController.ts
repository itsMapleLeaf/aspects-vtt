import { useMutation } from "convex/react"
import { useState } from "react"
import * as React from "react"
import { Rect } from "#app/common/Rect.js"
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

export type CanvasMapController = ReturnType<typeof useCanvasMapController>

const MouseButtonLeft = 0
const MouseButtonRight = 2
const MouseButtonMiddle = 1

export function useCanvasMapController() {
	const scene = useScene()

	const [inputMode, setInputMode] = useState<InputMode>("select")
	const [camera, setCamera] = useState(new Camera())
	const [container, containerRef] = useState<HTMLElement | null>()
	const pointer = usePointerPosition()

	const [previewAreaStart, setPreviewAreaStart] = useState<Vector>()

	const previewArea = (() => {
		if (inputMode !== "draw") return
		if (!previewAreaStart) return
		return Rect.fromCorners(previewAreaStart, pointer)
	})()

	const addToken = useMutation(api.scenes.tokens.add)
	const updateToken = useMutation(api.scenes.tokens.update)

	const inputModeHandlers = {
		select: {
			onPointerDown: (event: React.PointerEvent<HTMLElement>) => {},
			onPointerMove: (event: React.PointerEvent<HTMLElement>) => {},
			onPointerUp: (event: React.PointerEvent<HTMLElement>) => {},
		},
		draw: {
			onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
				if (event.button === MouseButtonLeft) {
					setPreviewAreaStart(pointer)
					return
				}
			},
			onPointerMove: (event: React.PointerEvent<HTMLElement>) => {},
			onPointerUp: async (event: React.PointerEvent<HTMLElement>) => {},
		},
	}

	useWindowEvent("pointerup", async () => {
		if (inputMode === "draw" && previewArea && scene) {
			const worldRect = Rect.fromCorners(
				camera.viewportToWorld(previewArea.topLeft),
				camera.viewportToWorld(previewArea.bottomRight),
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

	function onPointerMove(event: React.PointerEvent<HTMLElement>) {
		inputModeHandlers[inputMode].onPointerMove(event)
	}

	function onPointerUp(event: React.PointerEvent<HTMLElement>) {
		inputModeHandlers[inputMode].onPointerUp(event)
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
		camera,
		previewArea,
		toggleDrawInputMode,
		containerProps: {
			ref: containerRef,
			onPointerDown,
			onPointerMove,
			onPointerUp,
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
