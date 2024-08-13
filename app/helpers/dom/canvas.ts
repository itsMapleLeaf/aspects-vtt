import { useLayoutEffect, useState } from "react"
import { unwrap } from "../errors.ts"
import { useResizeObserver } from "./useResizeObserver.ts"

export function useCanvasDraw(
	draw: (context: CanvasRenderingContext2D) => void,
) {
	const [canvas, canvasRef] = useState<HTMLCanvasElement | null>()

	useLayoutEffect(() => {
		if (!canvas) return
		draw(unwrap(canvas.getContext("2d")))
	}, [canvas, draw])

	useResizeObserver(canvas, ({ width, height }, canvas) => {
		canvas.width = width
		canvas.height = height
		draw(unwrap(canvas.getContext("2d")))
	})

	return canvasRef
}
