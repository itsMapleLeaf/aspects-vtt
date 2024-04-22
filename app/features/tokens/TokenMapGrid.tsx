import { type ComponentPropsWithoutRef, use, useCallback, useEffect, useRef } from "react"
import { timeoutEffect } from "#app/common/async.js"
import { expect } from "#app/common/expect.ts"
import { useResizeObserver } from "#app/common/useResizeObserver.js"
import { withMergedClassName } from "#app/ui/withMergedClassName.js"
import type { Doc } from "#convex/_generated/dataModel.js"
import { ZoomContext } from "./context.tsx"

interface TokenMapGridProps extends ComponentPropsWithoutRef<"canvas"> {
	scene: Doc<"scenes">
}

export function TokenMapGrid(props: TokenMapGridProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const zoom = use(ZoomContext)
	const lineWidth = Math.max(1 / zoom, 1)

	const draw = useCallback(() => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		const context = expect(canvas.getContext("2d"), "failed to get canvas context")
		const { width, height } = canvas

		context.strokeStyle = "black"
		context.lineWidth = lineWidth

		context.clearRect(0, 0, width, height)
		context.beginPath()

		for (let x = 0; x <= width; x += props.scene.cellSize) {
			context.moveTo(x, 0)
			context.lineTo(x, height)
		}

		for (let y = 0; y <= height; y += props.scene.cellSize) {
			context.moveTo(0, y)
			context.lineTo(width, y)
		}

		context.stroke()
	}, [props.scene.cellSize, lineWidth])

	useEffect(() => {
		// debounce to reduce draw calls
		return timeoutEffect(300, draw)
		// draw()
	}, [draw])

	useResizeObserver(canvasRef, (entry) => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		canvas.width = entry.contentRect.width
		canvas.height = entry.contentRect.height
		draw()
	})

	return (
		<canvas
			{...withMergedClassName(props, "pointer-events-none relative size-full")}
			ref={canvasRef}
		/>
	)
}

function pixelCoords<T extends readonly number[]>(...input: readonly [...T]): readonly [...T] {
	const output = [...input] as const
	for (const [index, value] of input.entries()) {
		output[index] = Math.floor(value) + 0.5
	}
	return output
}
