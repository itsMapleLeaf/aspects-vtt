import { Tooltip, TooltipProvider } from "@ariakit/react"
import { useMutation } from "convex/react"
import Konva from "konva"
import { clamp } from "lodash-es"
import { ReactNode, useEffect, useRef, useState } from "react"
import { Circle, Group, Image, Layer, Stage, StageProps } from "react-konva"
import { Html } from "react-konva-utils"
import * as v from "valibot"
import { roundTo } from "~/common/math.ts"
import { useImage, useLocalStorage, useWindowSize } from "~/common/react/dom.ts"
import { api } from "~/convex/_generated/api.js"
import type { Character, Scene } from "~/types.ts"

export function Battlemap({
	scene,
	characters,
	backgroundUrl,
}: {
	scene: Scene
	characters: Character[]
	backgroundUrl: string
}) {
	return (
		<BattlemapStage>
			<BattlemapBackground backgroundUrl={backgroundUrl} />
			{characters
				.toSorted((a, b) => a.updatedAt - b.updatedAt)
				.map((character) => (
					<BattlemapCharacterToken
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

function BattlemapCharacterToken({
	character,
	scene,
}: {
	character: Character
	scene: Scene
}) {
	const updateCharacter = useMutation(api.entities.characters.update)

	const [image] = useImage(character.imageUrl)
	const [over, setOver] = useState(false)
	const [dragging, setDragging] = useState(false)
	const ref = useRef<Konva.Group>(null)

	const roundedX = roundTo(character.battlemapPosition.x, scene.cellSize / 4)
	const roundedY = roundTo(character.battlemapPosition.y, scene.cellSize / 4)

	const position = { x: roundedX, y: roundedY }

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
				width={scene.cellSize}
				height={scene.cellSize}
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

					// update updatedAt so the character appears on top of others
					updateCharacter({
						characterId: character._id,
						updatedAt: Date.now(),
					})
				}}
				onDragEnd={(event) => {
					event.cancelBubble = true
					setDragging(false)

					updateCharacter({
						characterId: character._id,
						battlemapPosition: event.target.position(),
					})
				}}
				ref={ref}
			>
				<Circle
					fill="black"
					opacity={0.3}
					radius={scene.cellSize / 2 + 4}
					offset={{
						x: -scene.cellSize / 2,
						y: -scene.cellSize / 2,
					}}
				/>
				<Circle
					fill="black"
					opacity={0.3}
					radius={scene.cellSize / 2 + 2}
					offset={{
						x: -scene.cellSize / 2,
						y: -scene.cellSize / 2,
					}}
				/>
				<Image
					image={image}
					width={scene.cellSize}
					height={scene.cellSize}
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
						<p className="leading-none">{character.name}</p>
						<p className="text-sm leading-none text-primary-100/80">
							{character.race} &bull; {character.pronouns}
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
