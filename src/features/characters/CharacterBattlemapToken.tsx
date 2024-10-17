import Konva from "konva"
import { LucideEyeOff, VenetianMask } from "lucide-react"
import { useRef, useState } from "react"
import { Group, Image, Rect } from "react-konva"
import { Html } from "react-konva-utils"
import { roundTo } from "~/common/math.ts"
import { useMergedRefs } from "~/common/react/core.ts"
import { useImage } from "~/common/react/dom.ts"
import { StatusBar } from "~/components/StatusBar.tsx"
import { Tooltip, TooltipContent } from "~/ui/tooltip.tsx"
import { lightPanel } from "../../styles/panel.ts"
import { ApiToken } from "../battlemap/types.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { ApiScene } from "../scenes/types.ts"
import { CharacterEditorDialog } from "./CharacterEditorDialog.tsx"

export function CharacterBattlemapToken({
	token,
	scene,
	selected,
	shapeRef,
	tooltipsDisabled,
	onContextMenu,
	onSelect,
}: {
	token: ApiToken
	scene: ApiScene
	selected: boolean
	shapeRef: React.Ref<Konva.Shape>
	tooltipsDisabled: boolean
	onSelect: () => void
	onContextMenu: (event: Konva.KonvaEventObject<PointerEvent>) => void
}) {
	const [image] = useImage(
		token.character.imageId && getImageUrl(token.character.imageId),
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
			x: x,
			y: y,
			width: node.width() * scaleX,
			height: node.height() * scaleY,
		}
	}

	const ref = useMergedRefs(shapeRef, internalRef)

	const [editorOpen, setEditorOpen] = useState(false)

	return (
		<>
			<Group
				{...position}
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
				onPointerClick={(event) => {
					if (event.evt.button === 2) return
					// onSelect()
				}}
				onContextMenu={(event) => {
					event.evt.preventDefault()
					onContextMenu(event)
				}}
				onPointerDblClick={() => {
					setEditorOpen(true)
				}}
				ref={ref}
			>
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
						{...(image &&
							getCrop(image, { width: 70, height: 70 }, "center-top"))}
						cornerRadius={999999}
					/>
				) : (
					<Html divProps={{ className: "pointer-events-none" }}>
						<div
							{...{
								className: "flex items-center justify-center",
								style: {
									width: scene.cellSize,
									height: scene.cellSize,
								},
							}}
						>
							<VenetianMask className="size-1/2" />
						</div>
					</Html>
				)}
				{token.visible ? null : (
					<Html divProps={{ className: "pointer-events-none" }}>
						<div
							{...{
								className: "relative",
								style: { width: scene.cellSize, height: scene.cellSize },
							}}
						>
							<div
								className={lightPanel(
									"absolute bottom-0 right-0 translate-x-2 translate-y-2 rounded-full p-2.5",
								)}
							>
								<LucideEyeOff className="size-8" />
							</div>
						</div>
					</Html>
				)}
				{selected && (
					<Rect
						fill="skyblue"
						opacity={0.5}
						width={scene.cellSize}
						height={scene.cellSize}
						cornerRadius={999999}
					/>
				)}
			</Group>

			<Html transform={false}>
				<Tooltip open={over && !tooltipsDisabled} placement="bottom">
					<TooltipContent
						className="flex scale-90 flex-col items-center rounded bg-black/75 p-2 text-center font-bold text-white opacity-0 shadow transition gap-1 data-[enter]:scale-100 data-[enter]:opacity-100"
						unmountOnHide
						portal={false}
						flip={false}
						getAnchorRect={getAnchorRect}
					>
						<p className="leading-none">
							{token.character.identity?.name ?? "(unknown)"}
						</p>
						<p className="text-sm leading-none text-primary-100/80 empty:hidden">
							{[token.character.race, token.character.identity?.pronouns]
								.filter(Boolean)
								.join(" • ")}
						</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip open={over && !tooltipsDisabled} placement="top">
					<TooltipContent
						className="flex w-24 scale-90 flex-col bg-transparent opacity-0 shadow-none transition gap-1 data-[enter]:scale-100 data-[enter]:opacity-100"
						flip={false}
						portal={false}
						getAnchorRect={getAnchorRect}
					>
						{/* <div className="self-center rounded border-2 border-pink-700 bg-pink-700/75 px-1.5 py-1 leading-none text-white shadow">
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
						</div> */}
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

				{token.character.full && (
					<CharacterEditorDialog
						character={token.character.full}
						open={editorOpen}
						setOpen={setEditorOpen}
					></CharacterEditorDialog>
				)}
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
