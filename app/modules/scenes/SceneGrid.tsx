import { useEffect, useRef } from "react"
import { useSize } from "../../helpers/dom/useResizeObserver.ts"
import { unwrap } from "../../helpers/errors.ts"
import { useSceneContext } from "./SceneContext.tsx"
import type { GridWorkerMessage } from "./SceneGrid.worker.ts"

const sendMessage = (worker: Worker, message: GridWorkerMessage) => {
	worker.postMessage(message, message.type === "init" ? [message.canvas] : [])
}

export function SceneGrid() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const size = useSize(canvasRef)
	const { scene, viewport } = useSceneContext()
	const workerRef = useRef<Worker>(undefined)

	// useEffect(() => {
	// 	if (!workerRef.current) {
	// 		workerRef.current = new Worker(new URL("./SceneGrid.worker.ts", import.meta.url), {
	// 			type: "module",
	// 		})

	// 		const canvas = unwrap(canvasRef.current, "canvas ref not set")
	// 		const offscreen = canvas.transferControlToOffscreen()

	// 		sendMessage(workerRef.current, {
	// 			type: "init",
	// 			canvas: offscreen,
	// 		})
	// 	}

	// 	sendMessage(workerRef.current, {
	// 		type: "render",
	// 		canvasSize: size.xy,
	// 		viewportOffset: viewport.offset.xy,
	// 		cellSize: scene.cellSize * viewport.scale,
	// 	})
	// }, [scene.cellSize, size, viewport])

	// useEffect(() => {
	// 	return () => {
	// 		workerRef.current?.terminate()
	// 		workerRef.current = undefined
	// 	}
	// }, [])

	return (
		<canvas className="absolute inset-0 size-full" width={size.x} height={size.y} ref={canvasRef} />
	)
}
