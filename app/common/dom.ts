import { useLayoutEffect, useState } from "react"
import { expect } from "./expect.ts"
import { useResizeObserver } from "./useResizeObserver.ts"

export function loadImage(
	src: string,
	signal?: AbortSignal,
): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image()
		image.src = src
		if (image.complete) {
			resolve(image)
		} else {
			image.onload = () => resolve(image)
			image.onerror = () => reject(new Error(`Failed to load image "${src}"`))
		}
		signal?.addEventListener("abort", () => {
			image.onload = null
			image.onerror = null
			image.src = ""
			reject(new Error("Aborted"))
		})
	})
}

export function bindWindowEvent<K extends keyof WindowEventMap>(
	eventType: K,
	handler: (event: WindowEventMap[K]) => void,
	options?: AddEventListenerOptions,
) {
	window.addEventListener(eventType, handler, options)
	return () => {
		window.removeEventListener(eventType, handler, options)
	}
}

export function useCanvasDraw(
	draw: (context: CanvasRenderingContext2D) => void,
) {
	const [canvas, canvasRef] = useState<HTMLCanvasElement | null>()

	useLayoutEffect(() => {
		if (!canvas) return
		draw(expect(canvas.getContext("2d")))
	}, [canvas, draw])

	useResizeObserver(canvas, ({ width, height }, canvas) => {
		canvas.width = width
		canvas.height = height
		draw(expect(canvas.getContext("2d")))
	})

	return canvasRef
}
