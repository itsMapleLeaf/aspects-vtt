import Konva from "konva"
import { clamp } from "lodash-es"
import { ReactNode } from "react"
import { Image, Layer, Stage, StageProps } from "react-konva"
import * as v from "valibot"
import { useImage, useLocalStorage, useWindowSize } from "~/common/react/dom.ts"
import { CharacterBattlemapToken } from "../characters/CharacterBattlemapToken.tsx"
import type { ApiCharacter } from "../characters/types.ts"
import type { ApiScene } from "../scenes/types.ts"

Konva.dragButtons = [0, 2]

export function Battlemap({
	scene,
	characters,
	backgroundUrl,
}: {
	scene: ApiScene
	characters: ApiCharacter[]
	backgroundUrl: string
}) {
	return (
		<BattlemapStage>
			<BattlemapBackground backgroundUrl={backgroundUrl} />
			{characters
				.flatMap((c) => (c.tokenVisible || !c.protected ? [c] : []))
				.toSorted((a, b) => a.updatedAt - b.updatedAt)
				.map((character) => (
					<CharacterBattlemapToken
						key={character._id}
						character={character}
						scene={scene}
					/>
				))}
		</BattlemapStage>
	)
}

function BattlemapStage({
	children,
	...props
}: StageProps & { children: ReactNode }) {
	const [windowWidth, windowHeight] = useWindowSize()

	const [translateX, setTranslateX] = useLocalStorage(
		"viewportTranslateX",
		0,
		v.parser(v.number()),
	)

	const [translateY, setTranslateY] = useLocalStorage(
		"viewportTranslateY",
		0,
		v.parser(v.number()),
	)

	const [zoomTick, setZoomTick] = useLocalStorage(
		"viewportZoomTick",
		0,
		v.parser(v.number()),
	)

	const getZoom = (zoomTick: number) => 1.2 ** normalizeZoomTick(zoomTick)

	const normalizeZoomTick = (zoomTick: number) =>
		clamp(Math.round(zoomTick), -10, 10)

	const handleWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
		props.onWheel?.(event)

		const newZoomTick = normalizeZoomTick(
			zoomTick - Math.sign(event.evt.deltaY),
		)

		const oldScale = getZoom(zoomTick)
		const newScale = getZoom(newZoomTick)

		const mousePointTo = {
			x: event.evt.x / oldScale - translateX / oldScale,
			y: event.evt.y / oldScale - translateY / oldScale,
		}

		const newPos = {
			x: -(mousePointTo.x - event.evt.x / newScale) * newScale,
			y: -(mousePointTo.y - event.evt.y / newScale) * newScale,
		}

		setZoomTick(newZoomTick)
		setTranslateX(newPos.x)
		setTranslateY(newPos.y)
	}

	return (
		<Stage
			width={windowWidth}
			height={windowHeight}
			x={translateX}
			y={translateY}
			scaleX={getZoom(zoomTick)}
			scaleY={getZoom(zoomTick)}
			draggable
			{...props}
			onPointerDown={(event) => {
				props.onPointerDown?.(event)
			}}
			onDragStart={(event) => {
				props.onDragStart?.(event)
			}}
			onDragEnd={(event) => {
				props.onDragEnd?.(event)
				setTranslateX(event.target.x())
				setTranslateY(event.target.y())
			}}
			onContextMenu={(event) => {
				props.onContextMenu?.(event)
				event.evt.preventDefault()
			}}
			onWheel={handleWheel}
		>
			<Layer>{children}</Layer>
		</Stage>
	)
}

function BattlemapBackground({ backgroundUrl }: { backgroundUrl: string }) {
	const [image] = useImage(backgroundUrl)
	return <Image image={image} />
}
