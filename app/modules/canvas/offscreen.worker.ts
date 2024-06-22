import { unwrap } from "../../helpers/errors.ts"

export type OffscreenCanvasOperation =
	| OffscreenCanvasContextMethodOperations<
			"clearRect" | "fillRect" | "beginPath" | "moveTo" | "lineTo" | "stroke"
	  >
	| { type: "resize"; width: number; height: number }
	| {
			type: "drawImage"
			image: ImageBitmap
			args:
				| [x: number, y: number]
				| [x: number, y: number, w: number, h: number]
				| [
						sx: number,
						sy: number,
						sw: number,
						sh: number,
						dx: number,
						dy: number,
						dw: number,
						dh: number,
				  ]
	  }

export type OffscreenCanvasContextMethodOperations<
	K extends keyof OffscreenCanvasRenderingContext2D,
> =
	K extends keyof OffscreenCanvasRenderingContext2D ?
		OffscreenCanvasRenderingContext2D[K] extends (...args: infer A) => void ?
			{ type: K; args: A }
		:	never
	:	never

export type OffscreenCanvasWorkerMessage =
	| { type: "init"; canvas: OffscreenCanvas }
	| { type: "render"; operations: OffscreenCanvasOperation[] }

let canvas: OffscreenCanvas | undefined
let context: OffscreenCanvasRenderingContext2D | undefined

self.addEventListener("message", (event: MessageEvent<OffscreenCanvasWorkerMessage>) => {
	// eslint-disable-next-line no-console
	console.debug("offscreen worker message", event.data)

	if (event.data.type === "init") {
		canvas = unwrap(event.data.canvas, "canvas not supported")
		context = unwrap(canvas.getContext("2d"), "canvas not supported")
		return
	}

	if (!canvas || !context) return

	context.clearRect(0, 0, canvas.width, canvas.height)

	for (const op of event.data.operations) {
		switch (op.type) {
			case "resize": {
				canvas.width = op.width
				canvas.height = op.height
				break
			}
			case "drawImage": {
				// @ts-expect-error
				context.drawImage(op.image, ...op.args)
				break
			}
			case "beginPath": {
				break
			}
			case "stroke": {
				break
			}
			case "lineTo": {
				break
			}
			case "moveTo": {
				break
			}
			case "clearRect": {
				break
			}
			case "fillRect": {
				context.fillRect(...op.args)
				break
			}
		}
		// if (op.type === "resize") {
		// 	canvas.width = op.width
		// 	canvas.height = op.height
		// } else {
		// 	const method = unwrap(context[op.type], "method not supported")
		// 	// @ts-expect-error
		// 	method.apply(canvas, op.args)
		// }
	}
})
