import Konva from "konva"
import { useRef, useState } from "react"
import { Circle, Group, Image, Rect, Text } from "react-konva"
import { Html } from "react-konva-utils"
import { twMerge } from "tailwind-merge"
import { delta, lerp, roundTo } from "~/common/math.ts"
import { useMergedRefs } from "~/common/react/core.ts"
import { useImage } from "~/common/react/dom.ts"
import { StatusBar } from "~/components/StatusBar.tsx"
import { Tooltip, TooltipContent } from "~/ui/tooltip.tsx"
import { useCharacterEditorDialog } from "../characters/CharacterEditorDialog.tsx"
import { CharacterName } from "../characters/CharacterName.tsx"
import { getConditionColorClasses } from "../characters/conditions.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { ApiScene } from "../scenes/types.ts"
import { useTokenMenu } from "./TokenMenu.tsx"
import { ApiToken } from "./types.ts"

export function CharacterBattlemapToken({
	token,
	scene,
	selected,
	shapeRef,
}: {
	token: ApiToken
	scene: ApiScene
	selected: boolean
	shapeRef: React.Ref<Konva.Shape>
}) {
	const [image] = useImage(
		token.characterId &&
			token.character?.imageId &&
			getImageUrl(token.character.imageId),
	)
	const [over, setOver] = useState(false)

	const roundedX = roundTo(token.position.x, scene.cellSize / 4)
	const roundedY = roundTo(token.position.y, scene.cellSize / 4)

	const position = { x: roundedX, y: roundedY }

	const internalRef = useRef<Konva.Group>(null)

	const getAnchorRect = () => {
		const node = internalRef.current
		if (!node) return null
		const { x, y, scaleX, scaleY } = node.getAbsoluteTransform().decompose()
		return {
			x,
			y,
			width: node.width() * scaleX,
			height: node.height() * scaleY,
		}
	}

	const ref = useMergedRefs(shapeRef, internalRef)

	const characterMenu = useTokenMenu()
	const editor = useCharacterEditorDialog()

	return (
		<Group
			{...position}
			width={scene.cellSize}
			height={scene.cellSize}
			ref={ref}
		>
			<Group
				width={scene.cellSize}
				height={scene.cellSize}
				onPointerEnter={() => setOver(true)}
				onPointerLeave={() => setOver(false)}
				onPointerDown={(event) => {
					if (event.evt.button === 2) {
						event.evt.preventDefault()
						event.cancelBubble = true
					}

					// hack: when clicked, the menu opens, so we know we won't be over this token
					setOver(false)
				}}
				onPointerDblClick={(event) => {
					event.evt.preventDefault()
					event.cancelBubble = true
					if (token.characterId) {
						editor.show(token.characterId)
					}
				}}
				opacity={token.visible ? 1 : 0.6}
			>
				{token.characterId ? (
					<>
						<Rect
							fill="black"
							stroke="black"
							strokeWidth={8}
							opacity={0.3}
							width={scene.cellSize}
							height={scene.cellSize}
							cornerRadius={999999}
						/>
						<Rect
							fill="black"
							stroke="black"
							strokeWidth={4}
							opacity={0.3}
							width={scene.cellSize}
							height={scene.cellSize}
							cornerRadius={999999}
						/>

						{image ? (
							<Image
								image={image}
								width={scene.cellSize}
								height={scene.cellSize}
								{...getCrop(image, { width: 70, height: 70 }, "center-top")}
								cornerRadius={999999}
							/>
						) : null}

						<Html transform={false}>
							<Tooltip open={over && !characterMenu.open} placement="bottom">
								<TooltipContent
									className="flex scale-90 flex-col items-center rounded bg-black/75 p-2 text-center font-bold text-white opacity-0 shadow transition gap-1 data-[enter]:scale-100 data-[enter]:opacity-100"
									unmountOnHide
									portal={false}
									flip={false}
									getAnchorRect={getAnchorRect}
								>
									<p className="leading-none">
										<CharacterName character={token.character} />
									</p>
									<p className="text-sm leading-none text-primary-100/80 empty:hidden">
										{[token.character.race, token.character.pronouns]
											.filter(Boolean)
											.join(" • ")}
									</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip open={over && !characterMenu.open} placement="top">
								<TooltipContent
									className="flex w-24 scale-90 flex-col bg-transparent opacity-0 shadow-none transition gap-1 data-[enter]:scale-100 data-[enter]:opacity-100"
									flip={false}
									portal={false}
									getAnchorRect={getAnchorRect}
								>
									{[...new Set(token.character.conditions)].map((condition) => (
										<div
											key={condition}
											className={twMerge(
												"self-center rounded border-2 px-1.5 py-1 leading-none text-white shadow",
												getConditionColorClasses(condition),
											)}
										>
											{condition}
										</div>
									))}
									{token.character.full && (
										<StatusBar
											value={token.character.full.health}
											max={token.character.full.healthMax}
											className="text-green-500"
										/>
									)}
									{token.character.full && (
										<StatusBar
											value={token.character.full.resolve}
											max={token.character.full.resolveMax}
											className="text-blue-500"
										/>
									)}
								</TooltipContent>
							</Tooltip>
							{editor.element}
						</Html>
					</>
				) : (
					<Group
						offsetX={scene.cellSize / 2}
						offsetY={scene.cellSize / 2}
						x={scene.cellSize / 2}
						y={scene.cellSize / 2}
						ref={(node) => {
							if (!node) return

							const applyAnimationFrame = () => {
								const time = performance.now() / 1000
								const scale = lerp(0.6, 0.7, delta(Math.sin(time * 4), -1, 1))
								node.scale({ x: scale, y: scale })
							}
							applyAnimationFrame()

							const animation = new Konva.Animation(applyAnimationFrame)

							animation.start()
							return () => {
								animation.stop()
							}
						}}
					>
						<Circle
							x={scene.cellSize / 2}
							y={scene.cellSize / 2}
							radius={scene.cellSize / 2}
							fill="white"
							stroke="white"
							strokeWidth={12}
							opacity={0.6}
						/>
						<Circle
							x={scene.cellSize / 2}
							y={scene.cellSize / 2}
							radius={scene.cellSize / 2}
							fill="white"
							opacity={0.6}
						/>
						<Text
							text="!"
							fontFamily="Rubik Variable"
							fontStyle="bold"
							fontSize={scene.cellSize * 0.8}
							opacity={0.8}
							width={scene.cellSize}
							height={scene.cellSize}
							align="center"
							verticalAlign="middle"
						/>
					</Group>
				)}
			</Group>
			{selected && (
				<Circle
					x={scene.cellSize / 2}
					y={scene.cellSize / 2}
					radius={scene.cellSize / 2 + 8}
					fill="#38bdf8"
					stroke="#075985"
					strokeWidth={4}
					opacity={0.5}
				/>
			)}
		</Group>
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
