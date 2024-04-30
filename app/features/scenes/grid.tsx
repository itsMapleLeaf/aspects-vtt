import { type ComponentProps, useEffect, useRef } from "react"
import { expect } from "../../common/expect.ts"
import { useSize } from "../../common/useResizeObserver.ts"
import type { GridWorkerMessage } from "./grid.worker.ts"
import type { ApiScene } from "./types.ts"
import { ViewportStore } from "./viewport.tsx"

const sendMessage = (worker: Worker, message: GridWorkerMessage) => {
	worker.postMessage(message, message.type === "init" ? [message.canvas] : [])
}

export function SceneGrid({ scene, ...props }: ComponentProps<"canvas"> & { scene: ApiScene }) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const size = useSize(canvasRef)
	const viewport = ViewportStore.useState()
	const workerRef = useRef<Worker>(undefined)

	useEffect(() => {
		if (!workerRef.current) {
			workerRef.current = new Worker(new URL("./grid.worker.ts", import.meta.url), {
				type: "module",
			})

			const canvas = expect(canvasRef.current, "canvas ref not set")
			const offscreen = canvas.transferControlToOffscreen()

			sendMessage(workerRef.current, {
				type: "init",
				canvas: offscreen,
			})
		}

		sendMessage(workerRef.current, {
			type: "render",
			canvasSize: size.xy,
			viewportOffset: viewport.offset.xy,
			cellSize: scene.cellSize * viewport.scale,
		})
	})

	return (
		<canvas
			{...props}
			className="absolute inset-0 size-full"
			width={size.x}
			height={size.y}
			ref={canvasRef}
		/>
	)
}
