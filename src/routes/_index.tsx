import Konva from "konva"
import { clamp } from "lodash-es"
import { useState } from "react"
import { Image, Layer, Stage } from "react-konva"
import * as v from "valibot"
import luna from "~/assets/luna.png"
import map from "~/assets/map.jpg"
import map2 from "~/assets/map2.jpg"
import priya from "~/assets/priya.png"
import { useImage, useLocalStorage, useWindowSize } from "~/common/react/dom.ts"
import { Heading, HeadingLevel } from "~/common/react/heading.tsx"
import { Avatar, AvatarFallback } from "~/ui/avatar.tsx"
import { Card, CardTitle } from "~/ui/card.tsx"
import { heading } from "~/ui/styles.ts"

Konva.dragButtons = [0, 2]

export default function RoomRoute() {
	const [room, setRoom] = useState({
		name: "Rosenfeld",
		activeSceneId: "outer-rosenfeld",
	})

	const [scenes, setScenes] = useState([
		{
			id: "inner-rosenfeld",
			name: "Inner Rosenfeld",
			sceneryBackground: map,
		},
		{
			id: "outer-rosenfeld",
			name: "Outer Rosenfeld",
			battlemapBackground: map2,
		},
	])

	const [characters, setCharacters] = useState([
		{
			id: "luna",
			name: "Luna",
			pronouns: "she/her",
			race: "Renari",
			image: luna,
		},
		{
			id: "priya",
			name: "Priya",
			pronouns: "she/her",
			race: "Renari",
			image: priya,
		},
	])

	const activeScene = scenes.find((scene) => scene.id === room.activeSceneId)

	return (
		<>
			{activeScene == null ?
				null
			: activeScene.battlemapBackground ?
				<BattlemapStage>
					<BattlemapBackground
						backgroundUrl={activeScene.battlemapBackground}
					/>
				</BattlemapStage>
			: activeScene.sceneryBackground ?
				<img
					src={activeScene.sceneryBackground}
					alt=""
					className="absolute inset-0 size-full object-cover"
					draggable={false}
				/>
			:	null}

			<div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary-900" />

			<div className="pointer-events-children absolute inset-0 flex flex-col p-3 gap-3">
				<HeadingLevel>
					<header className="flex items-center justify-between">
						<Heading className={heading()}>{room.name}</Heading>
						<button>
							<Avatar>
								<AvatarFallback>M</AvatarFallback>
							</Avatar>
						</button>
						{activeScene && (
							<HeadingLevel>
								<div className="absolute inset-x-0 top-6 flex flex-col items-center">
									<Heading className="text-3xl font-light">
										{activeScene.name}
									</Heading>
									<p className="text-xl font-light">
										Harvest 24th, 365 &bull; Evening
									</p>
									<p className="text-xl font-light">(weather)</p>
								</div>
							</HeadingLevel>
						)}
					</header>

					<main className="pointer-events-children flex flex-1 items-stretch justify-between *:basis-64">
						<nav className="flex flex-col gap" aria-label="Left sidebar">
							<Card className="flex-1">
								<CardTitle>Characters</CardTitle>
							</Card>
							<Card className="flex-1">
								<CardTitle>Notes</CardTitle>
							</Card>
						</nav>
						<nav className="flex flex-col gap" aria-label="Right sidebar">
							<Card className="flex-1">
								<CardTitle>Combat</CardTitle>
							</Card>
							<Card className="flex-1">
								<CardTitle>Messages</CardTitle>
							</Card>
						</nav>
					</main>
				</HeadingLevel>
			</div>
		</>
	)
}

function BattlemapStage({ children }: { children: React.ReactNode }) {
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
		<Stage width={windowWidth} height={windowHeight} onWheel={handleWheel}>
			<Layer
				draggable
				x={translateX}
				y={translateY}
				scaleX={getZoom(zoomTick)}
				scaleY={getZoom(zoomTick)}
				onContextMenu={(event) => {
					event.evt.preventDefault()
				}}
				onDragEnd={(event) => {
					setTranslateX(event.target.x())
					setTranslateY(event.target.y())
				}}
			>
				{children}
			</Layer>
		</Stage>
	)
}

function BattlemapBackground({ backgroundUrl }: { backgroundUrl: string }) {
	const [image] = useImage(backgroundUrl)
	return <Image image={image} />
}
