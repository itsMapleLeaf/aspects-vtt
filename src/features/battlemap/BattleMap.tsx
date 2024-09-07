import Konva from "konva"
import { clamp } from "lodash-es"
import { Image, Layer, Stage } from "react-konva"
import * as v from "valibot"
import { observeSize } from "../../lib/dom"
import { useImage, useLocalStorage } from "../../lib/react"
import { ApiScene } from "../scenes/types"

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

	const [image] = useImage(scene.activeBackgroundUrl)

	const scaleFromTick = (tick: number) => 1.2 ** tick

	const handleWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
		event.evt.preventDefault()

		const stage = event.target.getStage()
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
		<Stage
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
			ref={(stage) => {
				if (!stage) return
				return observeSize(stage.container(), (contentRect) => {
					stage.width(contentRect.width)
					stage.height(contentRect.height)
				})
			}}
		>
			<Layer>
				{image && (
					<Image image={image} width={image.width} height={image.height} />
				)}
			</Layer>
		</Stage>
	)
}
