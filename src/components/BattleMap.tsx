import Konva from "konva"
import { clamp } from "lodash-es"
import { useRef } from "react"
import { Image, Layer, Stage } from "react-konva"
import * as v from "valibot"
import { useImage, useLocalStorage, useSize } from "../../lib/react"
import { ApiScene } from "../types"

Konva.dragButtons = [0, 2]

export function BattleMap({ scene }: { scene: ApiScene }) {
	const [position, setPosition] = useLocalStorage(
		"battleMapPosition",
		{ x: 0, y: 0 },
		v.parser(v.object({ x: v.number(), y: v.number() })),
	)

	const [scaleTick, setScaleTick] = useLocalStorage(
		"battleMapScaleTick",
		0,
		v.parser(v.number()),
	)

	const stageRef = useRef<Konva.Stage>(null)
	const [image] = useImage(scene.activeBackgroundUrl)
	const [size, sizeRef] = useSize()

	const scaleFromTick = (tick: number) => 1.2 ** tick

	const handleWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
		event.evt.preventDefault()

		const stage = stageRef.current
		if (!stage) return

		const pointer = stage.getPointerPosition()
		if (!pointer) return

		const currentScale = scaleFromTick(scaleTick)
		const mousePointTo = {
			x: (pointer.x - stage.x()) / currentScale,
			y: (pointer.y - stage.y()) / currentScale,
		}

		const newScaleTick = clamp(scaleTick - Math.sign(event.evt.deltaY), -10, 10)
		if (scaleTick === newScaleTick) return

		setScaleTick(newScaleTick)

		const newScale = scaleFromTick(newScaleTick)
		setPosition({
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		})
	}

	return (
		<div className="absolute inset-0" ref={sizeRef}>
			<Stage
				width={size.width}
				height={size.height}
				onWheel={handleWheel}
				scaleX={scaleFromTick(scaleTick)}
				scaleY={scaleFromTick(scaleTick)}
				x={position.x}
				y={position.y}
				onContextMenu={(event) => event.evt.preventDefault()}
				onPointerDown={(event) => {
					event.target.draggable(event.evt.button === 2)
				}}
				onPointerUp={(event) => {
					if (event.evt.button === 2) {
						setPosition(event.target.position())
					}
				}}
				ref={stageRef}
			>
				<Layer>
					{image && (
						<Image image={image} width={image.width} height={image.height} />
					)}
				</Layer>
			</Stage>
		</div>
	)
}
