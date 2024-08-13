import { unwrap } from "../../helpers/errors.ts"
import { mod } from "../../helpers/math.ts"

export type GridWorkerMessage =
	| { type: "init"; canvas: OffscreenCanvas }
	| {
			type: "render"
			canvasSize: { x: number; y: number }
			viewportOffset: { x: number; y: number }
			cellSize: number
	  }

let canvas: OffscreenCanvas | undefined
let context: OffscreenCanvasRenderingContext2D | undefined

self.addEventListener("message", (event: MessageEvent<GridWorkerMessage>) => {
	if (event.data.type === "init") {
		canvas = event.data.canvas
		context = unwrap(canvas.getContext("2d"), "canvas not supported")
	}

	if (event.data.type === "render") {
		if (!canvas || !context) {
			throw new Error("not initialized")
		}

		const { canvasSize, viewportOffset, cellSize } = event.data

		canvas.width = canvasSize.x
		canvas.height = canvasSize.y

		context.clearRect(0, 0, canvas.width, canvas.height)

		context.lineWidth = 1
		context.strokeStyle = "black"
		context.globalAlpha = 0.3

		context.beginPath()

		for (
			let x = mod(viewportOffset.x, cellSize);
			x < canvas.width;
			x += cellSize
		) {
			context.moveTo(x + 0.5, 0)
			context.lineTo(x + 0.5, canvas.height)
		}
		for (
			let y = mod(viewportOffset.y, cellSize);
			y < canvas.height;
			y += cellSize
		) {
			context.moveTo(0, y + 0.5)
			context.lineTo(canvas.width, y + 0.5)
		}

		context.stroke()
	}
})
