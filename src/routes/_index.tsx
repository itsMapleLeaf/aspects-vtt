import { Tooltip, TooltipProvider } from "@ariakit/react"
import { Iterator } from "iterator-helpers-polyfill"
import Konva from "konva"
import { clamp, random } from "lodash-es"
import { useEffect, useRef, useState, type ReactNode } from "react"
import {
	Circle,
	Group,
	Image,
	Layer,
	Stage,
	type StageProps,
} from "react-konva"
import { Html } from "react-konva-utils"
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

	const [characters, setCharacters] = useState(() =>
		Iterator.range(0, 50)
			.flatMap((i) => [
				{
					id: "luna" + i,
					name: "Luna",
					pronouns: "she/her",
					race: "Renari",
					imageUrl: luna,
					health: 20,
					resolve: 8,
					battlemapPosition: {
						x: random(0, 4000),
						y: random(0, 5000),
					},
					updatedAt: Date.now(),
				},
				{
					id: "priya" + i,
					name: "Priya",
					pronouns: "she/her",
					race: "Umbraleth",
					imageUrl: priya,
					health: 20,
					resolve: 8,
					battlemapPosition: {
						x: random(0, 4000),
						y: random(0, 5000),
					},
					updatedAt: Date.now(),
				},
			])
			.toArray(),
	)

	const activeScene = scenes.find((scene) => scene.id === room.activeSceneId)

	const [draggingViewport, setDraggingViewport] = useState(false)

	return (
		<>
			{activeScene == null ?
				null
			: activeScene.battlemapBackground ?
				<BattlemapStage>
					<BattlemapBackground
						backgroundUrl={activeScene.battlemapBackground}
					/>
					{characters
						.toSorted((a, b) => a.updatedAt - b.updatedAt)
						.map((character) => (
							<BattlemapCharacterToken
								key={character.id}
								{...character}
								cellSize={activeScene.cellSize}
								shadow={draggingViewport ? false : true}
								onDragStart={() => {
									setCharacters((current) => {
										return current.map((it) => {
											if (it.id !== character.id) return it
											return { ...it, updatedAt: Date.now() }
										})
									})
								}}
								onMove={(newPosition) => {
									setCharacters((current) => {
										return current.map((it) => {
											if (it.id !== character.id) return it
											return { ...it, battlemapPosition: newPosition }
										})
									})
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

function BattlemapCharacterToken({
	name,
	pronouns,
	race,
	imageUrl,
	health,
	resolve,
	battlemapPosition,
	cellSize,
	shadow = true,
	onMove,
	onDragStart,
}: {
	name: string
	pronouns: string
	race: string
	imageUrl: string
	health: number
	resolve: number
	battlemapPosition: { x: number; y: number }
	cellSize: number
	shadow?: boolean
	onMove: (newPosition: { x: number; y: number }) => void
	onDragStart: () => void
}) {
	const [image] = useImage(imageUrl)
	const [dragging, setDragging] = useState(false)

	const roundedX = roundTo(battlemapPosition.x, cellSize / 4)
	const roundedY = roundTo(battlemapPosition.y, cellSize / 4)

	const position = { x: roundedX, y: roundedY }

	const [over, setOver] = useState(false)
	const ref = useRef<Konva.Group>(null)

	useEffect(() => {
		ref.current?.offset({
			x: ref.current.width() / 2,
			y: ref.current.height() / 2,
		})
	})

	return (
		<>
			<Group
				{...position}
				width={cellSize}
				height={cellSize}
				onPointerEnter={() => setOver(true)}
				onPointerLeave={() => setOver(false)}
				draggable
				onPointerDown={(event) => {
					if (event.evt.button === 0) {
						event.cancelBubble = true
					} else {
						event.evt.preventDefault()
					}
				}}
				onDragStart={() => {
					setDragging(true)
					onDragStart()
				}}
				onDragEnd={(event) => {
					event.cancelBubble = true
					setDragging(false)
					onMove({
						x: event.target.x(),
						y: event.target.y(),
					})
				}}
				ref={ref}
			>
				<Circle
					fill="black"
					opacity={0.3}
					radius={cellSize / 2 + 4}
					offset={{
						x: -cellSize / 2,
						y: -cellSize / 2,
					}}
				/>
				<Circle
					fill="black"
					opacity={0.3}
					radius={cellSize / 2 + 2}
					offset={{
						x: -cellSize / 2,
						y: -cellSize / 2,
					}}
				/>
				<Image
					image={image}
					width={cellSize}
					height={cellSize}
					{...(image &&
						getCrop(image, { width: 70, height: 70 }, "center-top"))}
					cornerRadius={999999}
				/>
			</Group>

			<Html transform={false}>
				<TooltipProvider open={over && !dragging} placement="bottom">
					<Tooltip
						className="pointer-events-none flex scale-90 flex-col items-center rounded bg-black/75 p-2 text-center font-bold text-white opacity-0 shadow transition gap-1 data-[enter]:scale-100 data-[enter]:opacity-100"
						unmountOnHide
						portal={false}
						flip={false}
						getAnchorRect={() => {
							const node = ref.current
							if (!node) return null
							const { x, y, scaleX, scaleY } = node
								.getAbsoluteTransform()
								.decompose()
							return {
								x: x,
								y: y,
								width: node.width() * scaleX,
								height: node.height() * scaleY,
							}
						}}
					>
						<p className="leading-none">{name}</p>
						<p className="text-sm leading-none text-primary-100/80">
							{race} &bull; {pronouns}
						</p>
					</Tooltip>
				</TooltipProvider>
				<TooltipProvider open={over && !dragging} placement="top">
					<Tooltip
						className="pointer-events-none flex w-24 scale-90 flex-col opacity-0 transition gap-1 data-[enter]:scale-100 data-[enter]:opacity-100"
						unmountOnHide
						flip={false}
						portal={false}
						getAnchorRect={() => {
							const node = ref.current
							if (!node) return null
							const { x, y, scaleX, scaleY } = node
								.getAbsoluteTransform()
								.decompose()
							return {
								x: x,
								y: y,
								width: node.width() * scaleX,
								height: node.height() * scaleY,
							}
						}}
					>
						<div className="self-center rounded border-2 border-pink-700 bg-pink-700/75 px-1.5 py-1 leading-none text-white shadow">
							Gay
						</div>
						<div className="self-center rounded border-2 border-orange-700 bg-orange-700/75 px-1.5 py-1 leading-none text-white shadow">
							Angery
						</div>
						<div className="self-center rounded border-2 border-purple-700 bg-purple-700/75 px-1.5 py-1 leading-none text-white shadow">
							Sexy
						</div>
						<div className="self-center rounded border-2 border-red-700 bg-red-700/75 px-1.5 py-1 leading-none text-white shadow">
							Exploding
						</div>
						<div className="relative h-5 overflow-clip rounded border-2 border-green-500 shadow">
							{/* minus 1px inset ensures it actually fills the rectangle without a pixel gap from subpixel rendering */}
							<div className="absolute -inset-px origin-left scale-x-[0.3] bg-green-500/75" />
						</div>
						<div className="relative h-5 overflow-clip rounded border-2 border-blue-500 shadow">
							<div className="absolute -inset-px origin-left scale-x-[0.6] bg-blue-500/75" />
						</div>
					</Tooltip>
				</TooltipProvider>
			</Html>
		</>
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
