import * as React from "react"
import { expect } from "#app/common/expect.js"
import { mod } from "#app/common/math.js"
import { useResizeObserver } from "#app/common/useResizeObserver.js"
import { useImage } from "../../common/useImage.ts"
import { getApiImageUrl } from "../images/getApiImageUrl.tsx"
import { useScene } from "../scenes/context.tsx"
import { Camera } from "./Camera.tsx"

export function CanvasMap() {
	const scene = useScene()
	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const backgroundImage = useImage(scene?.background && getApiImageUrl(scene.background))
	const [camera, setCamera] = React.useState(new Camera())

	const draw = React.useCallback(() => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		const context = expect(canvas.getContext("2d"), "canvas not supported")

		context.clearRect(0, 0, canvas.width, canvas.height)

		if (backgroundImage) {
			isolateDraws(context, () => {
				context.globalAlpha = 0.5
				context.drawImage(
					backgroundImage,
					...camera.translation.times(-1).tuple,
					canvas.width,
					canvas.height,
					0,
					0,
					canvas.width,
					canvas.height,
				)
			})
		}

		const cellSize = scene?.cellSize ?? 0
		if (cellSize >= 4) {
			isolateDraws(context, () => {
				context.strokeStyle = "black"
				context.lineWidth = 1
				context.globalAlpha = 0.5

				context.beginPath()

				// vertical grid lines
				for (let x = mod(camera.position.x, cellSize); x < canvas.width; x += cellSize) {
					context.moveTo(x + 0.5, 0)
					context.lineTo(x + 0.5, canvas.height)
				}

				// horizontal grid lines
				for (let y = mod(camera.position.y, cellSize); y < canvas.height; y += cellSize) {
					context.moveTo(0, y + 0.5)
					context.lineTo(canvas.width, y + 0.5)
				}

				context.stroke()
			})
		}
	}, [scene?.cellSize, backgroundImage, camera])

	React.useEffect(() => {
		draw()
	}, [draw])

	useResizeObserver(canvasRef, (entry) => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		canvas.width = entry.contentRect.width
		canvas.height = entry.contentRect.height
		draw()
	})

	return (
		<canvas
			className="size-full"
			ref={canvasRef}
			onContextMenu={(event) => {
				event.preventDefault()
			}}
			onPointerDown={(event) => {
				event.preventDefault()

				if (event.button === 2) {
					const handleMove = (event: PointerEvent) => {
						setCamera((camera) => camera.movedBy(event.movementX, event.movementY))
					}

					const handleContextMenu = (event: Event) => {
						event.preventDefault()
					}

					const handleUp = (event: Event) => {
						event.preventDefault()

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
				}
			}}
		/>
	)
}

function isolateDraws(context: CanvasRenderingContext2D, fn: () => void) {
	context.save()
	fn()
	context.restore()
}
