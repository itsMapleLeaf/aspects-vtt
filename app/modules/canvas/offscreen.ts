import { useCallback, useEffect, useRef, useState } from "react"
import { unwrap } from "~/helpers/errors.ts"
import type { OffscreenCanvasOperation } from "./offscreen.worker.ts"

export function useOffscreenCanvas() {
	const [container, containerRef] = useState<HTMLDivElement | null>()
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const workerRef = useRef<Worker>(null)

	useEffect(() => {
		const worker = (workerRef.current = new Worker(
			new URL("./offscreen.worker.ts", import.meta.url),
			{
				type: "module",
			},
		))
		return () => {
			worker.terminate()
		}
	}, [])

	useEffect(() => {
		const canvas = (canvasRef.current = document.createElement("canvas"))
		canvas.style.position = "absolute"
		canvas.style.inset = "0"
		canvas.style.width = "100%"
		canvas.style.height = "100%"
		const offscreen = canvas.transferControlToOffscreen()
		unwrap(workerRef.current).postMessage({ type: "init", canvas: offscreen }, [offscreen])
	}, [])

	useEffect(() => {
		if (!container) return

		const canvas = unwrap(canvasRef.current, "canvas ref not set")
		workerRef.current?.postMessage({
			type: "render",
			operations: [
				{ type: "resize", width: container.clientWidth, height: container.clientHeight },
			],
		})
		container.appendChild(canvas)
	}, [container])

	const render = useCallback(function render(operations: OffscreenCanvasOperation[]) {
		workerRef.current?.postMessage({ type: "render", operations })
	}, [])

	return { containerRef, render }
}
