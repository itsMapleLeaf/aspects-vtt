import { useMutation } from "convex/react"
import { useState } from "react"
import * as React from "react"
import { Rect } from "#app/common/Rect.js"
import { useWindowEvent } from "#app/common/useWindowEvent.js"
import { Vector } from "#app/common/vector.js"
import { api } from "#convex/_generated/api.js"
import type { Branded } from "#convex/helpers.js"
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
	const [inputMode, setInputMode] = useState<InputMode>(() => "select")
	const [camera, setCamera] = useState(new Camera())
	const [container, containerRef] = useState<HTMLElement | null>()
	const pointer = usePointerPosition()

	const [previewAreaStart, setPreviewAreaStart] = useState<Vector>()

	const previewArea = (() => {
		if (inputMode !== "draw") return
		if (!previewAreaStart) return
		return Rect.fromCorners(
			camera.cameraToViewport(previewAreaStart),
			camera.cameraToViewport(pointer),
		)
	})()

	const addToken = useMutation(api.scenes.tokens.add)
	const updateToken = useMutation(api.scenes.tokens.update)

	function windowCoordsToMapCoords(windowCoords: Vector): Vector {
		const containerRect = container?.getBoundingClientRect() ?? { left: 0, top: 0 }
		return windowCoords
			.minus(containerRect.left, containerRect.top)
			.minus(camera.position)
			.dividedBy(camera.scale)
	}

	const inputModeHandlers = {
		select: {
			onPointerDown: (event: React.PointerEvent<HTMLElement>) => {},
			onPointerMove: (event: React.PointerEvent<HTMLElement>) => {},
			onPointerUp: (event: React.PointerEvent<HTMLElement>) => {},
		},
		draw: {
			onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
				if (event.button === MouseButtonLeft) {
					setPreviewAreaStart(windowCoordsToMapCoords(Vector.from(event.clientX, event.clientY)))
					return
				}
			},
			onPointerMove: (event: React.PointerEvent<HTMLElement>) => {},
			onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
				// const { x: width, y: height } = rect.size //.times(camera.scale)
				// addToken({
				// 	sceneId: scene._id,
				// 	position: rect.position.xy,
				// 	visible: true,
				// 	area: {
				// 		width,
				// 		height,
				// 		color: randomItem(["red", "orange", "yellow", "green", "blue", "purple"]),
				// 	},
				// })
				console.log(previewArea)
				setPreviewAreaStart(undefined)
			},
		},
	}

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
