import { type ComponentProps, useLayoutEffect, useRef } from "react"
import { expect } from "../../common/expect.ts"
import { mod } from "../../common/math.ts"
import { useSize } from "../../common/useResizeObserver.ts"
import type { ApiScene } from "./types.ts"
import { ViewportStore } from "./viewport.tsx"

export function SceneGrid({ scene, ...props }: ComponentProps<"canvas"> & { scene: ApiScene }) {
	const ref = useRef<HTMLCanvasElement>(null)
	const size = useSize(ref)
	const viewport = ViewportStore.useState()

	useLayoutEffect(() => {
		const canvas = expect(ref.current, "canvas ref not set")
		const context = expect(canvas.getContext("2d"), "canvas not supported")

		const cellSize = scene.cellSize * viewport.scale

		context.clearRect(0, 0, canvas.width, canvas.height)

		context.lineWidth = 1
		context.strokeStyle = "black"
		context.globalAlpha = 0.3

		context.beginPath()

		for (let x = mod(viewport.offset.x, cellSize); x < canvas.width; x += cellSize) {
			context.moveTo(x + 0.5, 0)
			context.lineTo(x + 0.5, canvas.height)
		}
		for (let y = mod(viewport.offset.y, cellSize); y < canvas.height; y += cellSize) {
			context.moveTo(0, y + 0.5)
			context.lineTo(canvas.width, y + 0.5)
		}

		context.stroke()
	})

	return (
		<canvas
			{...props}
			className="absolute inset-0 size-full"
			width={size.x}
			height={size.y}
			ref={ref}
		/>
	)
}
