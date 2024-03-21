import { useCallback, useEffect, useRef } from "react"
import { expect } from "#app/common/expect.ts"
import { useResizeObserver } from "#app/common/useResizeObserver.js"
import { useRoom } from "../rooms/roomContext.tsx"

export function TokenMapGrid({
	offsetX,
	offsetY,
}: {
	offsetX: number
	offsetY: number
}) {
	const room = useRoom()
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const draw = useCallback(() => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		const context = expect(canvas.getContext("2d"), "failed to get canvas context")

		context.clearRect(0, 0, canvas.width, canvas.height)

		context.save()

		context.strokeStyle = "white"
		context.globalAlpha = 0.2

		context.beginPath()

		for (let x = offsetX % room.mapCellSize; x <= canvas.width; x += room.mapCellSize) {
			context.moveTo(...pixelCoords(x, 0))
			context.lineTo(...pixelCoords(x, canvas.height))
		}

		for (let y = offsetY % room.mapCellSize; y <= canvas.height; y += room.mapCellSize) {
			context.moveTo(...pixelCoords(0, y))
			context.lineTo(...pixelCoords(canvas.width, y))
		}

		context.stroke()

		context.restore()

		// context.save()
		// context.fillStyle = "white"
		// context.font = "16px sans-serif"
		// context.textBaseline = "top"
		// context.fillText(`offset: ${Math.round(offsetX)}, ${Math.round(offsetY)}`, 10, 10)
		// context.restore()
	}, [offsetX, offsetY, room.mapCellSize])

	useEffect(() => {
		draw()
	}, [draw])

	useResizeObserver(canvasRef, (entry) => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		canvas.width = entry.contentRect.width
		canvas.height = entry.contentRect.height
		draw()
	})

	return <canvas ref={canvasRef} className="pointer-events-none relative size-full" />
}

function pixelCoords<T extends readonly number[]>(...input: readonly [...T]): readonly [...T] {
	const output = [...input] as const
	for (const [index, value] of input.entries()) {
		output[index] = Math.floor(value) + 0.5
	}
	return output
}
