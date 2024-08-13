import { useEffect, useRef } from "react"
import { useSize } from "../../../common/dom/useResizeObserver.ts"
import { unwrap } from "../../../common/errors.ts"
import { useSceneContext } from "./SceneContext.tsx"
import type { GridWorkerMessage } from "./SceneGrid.worker.ts"

let worker: Worker | undefined
if (typeof window !== "undefined") {
	worker = new Worker(new URL("./SceneGrid.worker.ts", import.meta.url), {
		type: "module",
	})
}

const sendMessage = (message: GridWorkerMessage) => {
	worker?.postMessage(message, message.type === "init" ? [message.canvas] : [])
}

export function SceneGrid() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const offscreenRef = useRef<OffscreenCanvas>(null)
	const { scene, viewport } = useSceneContext()
	const size = useSize(canvasRef)

	useEffect(() => {
		const canvas = unwrap(canvasRef.current, "canvas ref not set")
		if (!offscreenRef.current) {
			const offscreen = (offscreenRef.current ??= canvas.transferControlToOffscreen())
			sendMessage({
				type: "init",
				canvas: offscreen,
			})
		}
	}, [])

	useEffect(() => {
		sendMessage({
			type: "render",
			canvasSize: size.xy,
			viewportOffset: viewport.offset.xy,
			cellSize: scene.cellSize * viewport.scale,
		})
	}, [scene.cellSize, size, viewport])

	return (
		<canvas className="absolute inset-0 size-full" width={size.x} height={size.y} ref={canvasRef} />
	)
}
