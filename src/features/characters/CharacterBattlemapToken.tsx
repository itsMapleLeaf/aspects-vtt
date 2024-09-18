import { useMutation } from "convex/react"
import Konva from "konva"
import { LucideEdit, LucideSwords } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Circle, Group, Image } from "react-konva"
import { Html } from "react-konva-utils"
import { roundTo } from "~/common/math.ts"
import { useImage } from "~/common/react/dom.ts"
import { api } from "~/convex/_generated/api.js"
import { Character, Scene } from "~/types.ts"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "~/ui/dropdown-menu.tsx"
import { Tooltip, TooltipContent } from "~/ui/tooltip.tsx"
import { CharacterAttributeButtonRow } from "./CharacterAttributeButtonRow.tsx"
import { CharacterEditorDialog } from "./CharacterEditorDialog.tsx"
import { CharacterVitalFields } from "./CharacterVitalFields.tsx"

export function CharacterBattlemapToken({
	character,
	scene,
}: {
	character: Character
	scene: Scene
}) {
	const updateCharacter = useMutation(api.entities.characters.update)

	const [image] = useImage(character.imageUrl)
	const [dragging, setDragging] = useState(false)
	const [over, setOver] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)
	const [editorOpen, setEditorOpen] = useState(false)
	const ref = useRef<Konva.Group>(null)

	const roundedX = roundTo(character.battlemapPosition.x, scene.cellSize / 4)
	const roundedY = roundTo(character.battlemapPosition.y, scene.cellSize / 4)

	const position = { x: roundedX, y: roundedY }

	const getAnchorRect = () => {
		const node = ref.current
		if (!node) return null
		const { x, y, scaleX, scaleY } = node.getAbsoluteTransform().decompose()
		return {
			x: x,
			y: y,
			width: node.width() * scaleX,
			height: node.height() * scaleY,
		}
	}

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
				onPointerClick={(event) => {
					setMenuOpen(true)
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
				<Tooltip open={over && !dragging} placement="bottom">
					<TooltipContent
						className="pointer-events-none flex scale-90 flex-col items-center rounded bg-black/75 p-2 text-center font-bold text-white opacity-0 shadow transition gap-1 data-[enter]:scale-100 data-[enter]:opacity-100"
						unmountOnHide
						portal={false}
						flip={false}
						getAnchorRect={getAnchorRect}
					>
						<p className="leading-none empty:hidden">{character.name}</p>
						<p className="text-sm leading-none text-primary-100/80 empty:hidden">
							{[character.race, character.pronouns].filter(Boolean).join(" • ")}
						</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip open={over && !dragging} placement="top">
					<TooltipContent
						className="pointer-events-none flex w-24 scale-90 flex-col bg-transparent opacity-0 shadow-none transition gap-1 data-[enter]:scale-100 data-[enter]:opacity-100"
						unmountOnHide
						flip={false}
						portal={false}
						getAnchorRect={getAnchorRect}
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
					</TooltipContent>
				</Tooltip>

				<DropdownMenu open={menuOpen} setOpen={setMenuOpen} placement="bottom">
					<DropdownMenuContent
						getAnchorRect={getAnchorRect}
						className="rounded-lg"
					>
						<CharacterAttributeButtonRow />
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => setEditorOpen(true)}>
							<LucideEdit /> Edit
						</DropdownMenuItem>
						<DropdownMenuItem>
							<LucideSwords /> Attack
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<CharacterVitalFields className="w-[220px] p-1 gap-2" />
					</DropdownMenuContent>
				</DropdownMenu>

				<CharacterEditorDialog open={editorOpen} onOpenChange={setEditorOpen} />
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
