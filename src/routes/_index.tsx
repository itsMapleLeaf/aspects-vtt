import Konva from "konva"
import { clamp } from "lodash-es"
import { startTransition, useState } from "react"
import { Image, Layer, Stage } from "react-konva"
import * as v from "valibot"
import luna from "~/assets/luna.png"
import map from "~/assets/map.jpg"
import map2 from "~/assets/map2.jpg"
import priya from "~/assets/priya.png"
import { roundTo } from "~/common/math.ts"
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
			cellSize: 140,
		},
		{
			id: "outer-rosenfeld",
			name: "Outer Rosenfeld",
			battlemapBackground: map2,
			cellSize: 140,
		},
	])

	const [characters, setCharacters] = useState([
		{
			id: "luna",
			name: "Luna",
			pronouns: "she/her",
			race: "Renari",
			imageUrl: luna,
			health: 20,
			resolve: 8,
			battlemapPosition: {
				x: 70,
				y: 70,
			},
		},
		{
			id: "priya",
			name: "Priya",
			pronouns: "she/her",
			race: "Renari",
			imageUrl: priya,
			health: 20,
			resolve: 8,
			battlemapPosition: {
				x: 140,
				y: 140,
			},
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
					{characters.map((character) => (
						<BattlemapCharacterToken
							key={character.id}
							{...character}
							cellSize={activeScene.cellSize}
							onMove={(pos) => {
								setCharacters((prev) =>
									prev.map((it) =>
										it.id === character.id ?
											{ ...it, battlemapPosition: pos }
										:	it,
									),
								)
							}}
						/>
					))}
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
					<header className="pointer-events-children flex items-center justify-between">
						<Heading className={heading()}>{room.name}</Heading>
						<button>
							<Avatar>
								<AvatarFallback>M</AvatarFallback>
							</Avatar>
						</button>
						{activeScene && (
							<HeadingLevel>
								<div className="pointer-events-children absolute inset-x-0 top-6 flex flex-col items-center">
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
		<Stage
			width={windowWidth}
			height={windowHeight}
			x={translateX}
			y={translateY}
			scaleX={getZoom(zoomTick)}
			scaleY={getZoom(zoomTick)}
			onWheel={handleWheel}
			draggable
			onPointerDown={(event) => {
				if (event.evt.button !== 2) {
					event.evt.preventDefault()
				}
			}}
			onDragEnd={(event) => {
				setTranslateX(event.target.x())
				setTranslateY(event.target.y())
			}}
			onContextMenu={(event) => {
				event.evt.preventDefault()
			}}
		>
			<Layer>{children}</Layer>
		</Stage>
	)
}

function BattlemapBackground({ backgroundUrl }: { backgroundUrl: string }) {
	const [image] = useImage(backgroundUrl)
	return <Image image={image} />
}

function BattlemapCharacterToken({
	name,
	pronouns,
	race,
	imageUrl,
	health,
	resolve,
	battlemapPosition,
	cellSize,
	onMove,
}: {
	name: string
	pronouns: string
	race: string
	imageUrl: string
	health: number
	resolve: number
	battlemapPosition: { x: number; y: number }
	cellSize: number
	onMove: (newPosition: { x: number; y: number }) => void
}) {
	const [image] = useImage(imageUrl)
	const [dragging, setDragging] = useState(false)

	const roundedX = roundTo(battlemapPosition.x, cellSize / 4)
	const roundedY = roundTo(battlemapPosition.y, cellSize / 4)

	return (
		<Image
			image={image}
			x={dragging ? undefined : roundedX}
			y={dragging ? undefined : roundedY}
			width={cellSize}
			height={cellSize}
			{...(image && getCrop(image, { width: 70, height: 70 }, "center-top"))}
			cornerRadius={Number.POSITIVE_INFINITY}
			shadowColor="black"
			shadowOpacity={0.5}
			shadowBlur={8}
			draggable
			onPointerDown={(event) => {
				if (event.evt.button === 0) {
					event.cancelBubble = true
				}
			}}
			onDragStart={(event) => {
				startTransition(() => {
					setDragging(true)
				})
			}}
			onDragEnd={(event) => {
				event.cancelBubble = true
				setDragging(false)
				onMove({
					x: event.target.x(),
					y: event.target.y(),
				})
			}}
		/>
	)
}

// function to calculate crop values from source image, its visible size and a crop strategy
function getCrop(
	image: HTMLImageElement,
	size: { width: number; height: number },
	clipPosition = "center-middle",
) {
	const width = size.width
	const height = size.height
	const aspectRatio = width / height

	let newWidth
	let newHeight

	const imageRatio = image.width / image.height

	if (aspectRatio >= imageRatio) {
		newWidth = image.width
		newHeight = image.width / aspectRatio
	} else {
		newWidth = image.height * aspectRatio
		newHeight = image.height
	}

	let x = 0
	let y = 0
	if (clipPosition === "left-top") {
		x = 0
		y = 0
	} else if (clipPosition === "left-middle") {
		x = 0
		y = (image.height - newHeight) / 2
	} else if (clipPosition === "left-bottom") {
		x = 0
		y = image.height - newHeight
	} else if (clipPosition === "center-top") {
		x = (image.width - newWidth) / 2
		y = 0
	} else if (clipPosition === "center-middle") {
		x = (image.width - newWidth) / 2
		y = (image.height - newHeight) / 2
	} else if (clipPosition === "center-bottom") {
		x = (image.width - newWidth) / 2
		y = image.height - newHeight
	} else if (clipPosition === "right-top") {
		x = image.width - newWidth
		y = 0
	} else if (clipPosition === "right-middle") {
		x = image.width - newWidth
		y = (image.height - newHeight) / 2
	} else if (clipPosition === "right-bottom") {
		x = image.width - newWidth
		y = image.height - newHeight
	} else if (clipPosition === "scale") {
		x = 0
		y = 0
		newWidth = width
		newHeight = height
	} else {
		console.error(new Error("Unknown clip position property - " + clipPosition))
	}

	return {
		cropX: x,
		cropY: y,
		cropWidth: newWidth,
		cropHeight: newHeight,
	}
}
