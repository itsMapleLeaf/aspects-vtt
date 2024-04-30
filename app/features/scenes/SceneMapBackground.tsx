import * as React from "react"
import type { Doc } from "../../../convex/_generated/dataModel.js"
import { Rect } from "../../common/Rect.ts"
import { expect } from "../../common/expect.ts"
import { mod } from "../../common/math.ts"
import { useImage } from "../../common/useImage.ts"
import { useResizeObserver } from "../../common/useResizeObserver.ts"
import { Vector } from "../../common/vector.ts"
import { getApiImageUrl } from "../images/getApiImageUrl.tsx"
import { useSceneContext } from "./SceneContext.tsx"
import { ViewportStore } from "./viewport.tsx"

export function SceneMapBackground({ scene }: { scene: Doc<"scenes"> }) {
	const viewport = ViewportStore.useState()

	return scene.background ? (
		<img
			src={getApiImageUrl(scene.background)}
			alt=""
			draggable={false}
			style={{
				width: scene.backgroundDimensions?.x,
				height: scene.backgroundDimensions?.y,
				scale: viewport.scale,
				translate: `${viewport.offset.x}px ${viewport.offset.y}px`,
			}}
			className="max-w-[unset] origin-top-left"
		/>
	) : null
}

function SceneMapBackgroundOld({ scene }: { scene: Doc<"scenes"> }) {
	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const backgroundImage = useImage(scene.background && getApiImageUrl(scene.background))
	const viewport = ViewportStore.useState()
	const controller = useSceneContext()
	const multiSelectArea = controller.getMultiSelectArea()

	React.useLayoutEffect(() => {
		draw()
	})

	useResizeObserver(canvasRef, (entry) => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		canvas.width = entry.contentRect.width
		canvas.height = entry.contentRect.height
		draw()
	})

	function draw() {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		const context = expect(canvas.getContext("2d"), "canvas not supported")
		const cellSize = (scene?.cellSize ?? 0) * viewport.scale

		context.clearRect(0, 0, canvas.width, canvas.height)

		if (backgroundImage) {
			isolateDraws(context, () => {
				context.globalAlpha = 0.75
				context.drawImage(
					backgroundImage,
					...viewport.offset.dividedBy(viewport.scale).times(-1).tuple,
					...Vector.fromSize(canvas).dividedBy(viewport.scale).tuple,
					...Vector.zero.tuple,
					...Vector.fromSize(canvas).tuple,
				)
			})
		}

		if (cellSize >= 4) {
			isolateDraws(context, () => {
				context.strokeStyle = "black"
				context.lineWidth = 1
				context.globalAlpha = 0.25

				context.beginPath()

				// vertical grid lines
				for (let x = mod(viewport.offset.x, cellSize); x < canvas.width; x += cellSize) {
					context.moveTo(x + 0.5, 0)
					context.lineTo(x + 0.5, canvas.height)
				}

				// horizontal grid lines
				for (let y = mod(viewport.offset.y, cellSize); y < canvas.height; y += cellSize) {
					context.moveTo(0, y + 0.5)
					context.lineTo(canvas.width, y + 0.5)
				}

				context.stroke()
			})
		}

		if (multiSelectArea) {
			drawRect(context, multiSelectArea)
		}

		if (controller.previewArea) {
			drawRect(
				context,
				Rect.from({
					topLeft: controller.previewArea.topLeft
						.minus(viewport.offset)
						.floorTo(cellSize)
						.plus(viewport.offset),
					bottomRight: controller.previewArea.bottomRight
						.minus(viewport.offset)
						.ceilingTo(cellSize)
						.plus(viewport.offset),
				}),
			)
		}
	}

	function drawRect(context: CanvasRenderingContext2D, rect: Rect) {
		isolateDraws(context, () => {
			context.fillStyle = "white"
			context.strokeStyle = "white"
			context.lineWidth = 2
			context.lineJoin = "round"

			context.globalAlpha = 0.5
			context.fillRect(...rect.tuple)

			context.globalAlpha = 1
			context.strokeRect(...rect.tuple)
		})
	}

	function isolateDraws(context: CanvasRenderingContext2D, fn: () => void) {
		context.save()
		fn()
		context.restore()
	}

	return <canvas className="absolute inset-0 size-full" ref={canvasRef} />
}
