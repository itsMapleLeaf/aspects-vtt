import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import * as React from "react"
import { z } from "zod"
import { expect } from "#app/common/expect.js"
import { mod } from "#app/common/math.js"
import { useResizeObserver } from "#app/common/useResizeObserver.js"
import { Vector } from "#app/common/vector.js"
import { ContextMenu } from "#app/ui/ContextMenu.js"
import { Tooltip } from "#app/ui/Tooltip.js"
import { api } from "#convex/_generated/api.js"
import type { Doc, Id } from "#convex/_generated/dataModel.js"
import { useImage } from "../../common/useImage.ts"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { getApiImageUrl } from "../images/getApiImageUrl.tsx"
import { Camera } from "./Camera.tsx"
import { useRoom } from "./roomContext.tsx"

const canvasMapDropActionSchema = z.union([
	z.object({
		type: z.literal("addCharacter"),
		characterId: z.custom<Id<"characters">>((data) => typeof data === "string"),
	}),
	z.object({
		type: z.literal("moveCharacter"),
		characterId: z.custom<Id<"characters">>((data) => typeof data === "string"),
	}),
])

export function defineCanvasMapDropAction(input: z.output<typeof canvasMapDropActionSchema>) {
	return input
}

export function CanvasMap({ scene }: { scene: Doc<"scenes"> }) {
	const room = useRoom()
	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const backgroundImage = useImage(scene?.background && getApiImageUrl(scene.background))
	const [camera, setCamera] = React.useState(new Camera())
	const sceneCharacters = useQuery(api.scenes.characters.list, { sceneId: scene._id })
	const addSceneCharacter = useMutation(api.scenes.characters.add)
	const updateSceneCharacter = useMutation(api.scenes.characters.update)
	const removeSceneCharacter = useMutation(api.scenes.characters.remove)

	const draw = React.useCallback(() => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		const context = expect(canvas.getContext("2d"), "canvas not supported")
		const cellSize = (scene?.cellSize ?? 0) * camera.scale

		context.clearRect(0, 0, canvas.width, canvas.height)

		if (backgroundImage) {
			isolateDraws(context, () => {
				context.globalAlpha = 0.5
				context.drawImage(
					backgroundImage,
					...camera.position.dividedBy(camera.scale).times(-1).tuple,
					...Vector.fromSize(canvas).dividedBy(camera.scale).tuple,
					...Vector.zero.tuple,
					...Vector.fromSize(canvas).tuple,
				)
			})
		}

		if (cellSize >= 4) {
			isolateDraws(context, () => {
				context.strokeStyle = "black"
				context.lineWidth = 1
				context.globalAlpha = 0.5

				context.beginPath()

				// vertical grid lines
				for (let x = mod(camera.position.x, cellSize); x < canvas.width; x += cellSize) {
					context.moveTo(x + 0.5, 0)
					context.lineTo(x + 0.5, canvas.height)
				}

				// horizontal grid lines
				for (let y = mod(camera.position.y, cellSize); y < canvas.height; y += cellSize) {
					context.moveTo(0, y + 0.5)
					context.lineTo(canvas.width, y + 0.5)
				}

				context.stroke()
			})
		}
	}, [scene?.cellSize, backgroundImage, camera])

	React.useEffect(() => {
		draw()
	}, [draw])

	useResizeObserver(canvasRef, (entry) => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		canvas.width = entry.contentRect.width
		canvas.height = entry.contentRect.height
		draw()
	})

	return (
		<div className="relative size-full">
			<canvas
				className="absolute inset-0 size-full"
				ref={canvasRef}
				onContextMenu={(event) => {
					event.preventDefault()
				}}
				onPointerDown={(event) => {
					event.preventDefault()

					if (event.button === 2) {
						const handleMove = (event: PointerEvent) => {
							setCamera((camera) => camera.movedBy(event.movementX, event.movementY))
						}

						const handleContextMenu = (event: Event) => {
							event.preventDefault()
						}

						const handleUp = (event: Event) => {
							event.preventDefault()

							// delay to allow context menu handler to run
							setTimeout(() => {
								document.removeEventListener("pointermove", handleMove)
								document.removeEventListener("pointerup", handleUp)
								document.removeEventListener("pointercancel", handleUp)
								document.removeEventListener("blur", handleUp)
								document.removeEventListener("contextmenu", handleContextMenu)
							})
						}

						document.addEventListener("pointermove", handleMove)
						document.addEventListener("pointerup", handleUp)
						document.addEventListener("pointercancel", handleUp)
						document.addEventListener("blur", handleUp)
						document.addEventListener("contextmenu", handleContextMenu)
					}
				}}
				onWheel={(event) => {
					const delta = Math.sign(event.deltaY)
					if (delta === 0) return

					const rect = event.currentTarget.getBoundingClientRect()

					const pivot = Vector.from(event.clientX, event.clientY)
						.minus(rect.left, rect.top)
						.minus(camera.position)

					setCamera((camera) => camera.zoomedBy(delta * -1, pivot))
				}}
				onDragOver={(event) => {
					event.preventDefault()
					event.dataTransfer.dropEffect = "move"
				}}
				onDrop={async (event) => {
					try {
						event.preventDefault()

						const action = canvasMapDropActionSchema.parse(
							JSON.parse(event.dataTransfer.getData("text/plain")),
						)

						const canvasRect = event.currentTarget.getBoundingClientRect()

						const position = Vector.from(event.clientX, event.clientY)
							.minus(canvasRect.left, canvasRect.top)
							.minus(camera.position)
							.dividedBy(camera.scale).rounded

						const isInScene = sceneCharacters?.some((it) => it.character._id === action.characterId)

						if (action.type === "addCharacter" && !isInScene) {
							await addSceneCharacter({
								characterId: action.characterId,
								sceneId: scene._id,
								position: position.xy,
							})
						}

						if (action.type === "moveCharacter" || (action.type === "addCharacter" && isInScene)) {
							await updateSceneCharacter({
								characterId: action.characterId,
								sceneId: scene._id,
								position: position.xy,
							})
						}
					} catch (error) {
						alert("Failed to add character to scene, try again")
						console.error(error)
					}
				}}
			/>

			{sceneCharacters?.map(({ character, token }) => (
				<ContextMenu
					key={character._id}
					disabled={!room.isOwner}
					options={[
						{
							label: token.visible ? "Hide" : "Reveal",
							icon: token.visible ? <Lucide.EyeOff /> : <Lucide.Eye />,
							onClick() {
								return updateSceneCharacter({
									characterId: character._id,
									sceneId: scene._id,
									visible: !token.visible,
								})
							},
						},
						{
							label: "Remove",
							icon: <Lucide.X />,
							onClick() {
								return removeSceneCharacter({ characterId: character._id, sceneId: scene._id })
							},
						},
					]}
				>
					<Tooltip content={character.displayName} placement="bottom">
						<button
							type="button"
							className="absolute"
							style={{
								width: scene.cellSize * camera.scale,
								height: scene.cellSize * camera.scale,
								translate: toTranslateString(
									Vector.from(token.position)
										.floorTo(scene.cellSize)
										.times(camera.scale)
										.plus(camera.position),
								),
							}}
							draggable
							onDragStart={(event) => {
								const image = expect(
									event.currentTarget.querySelector("[data-image]"),
									"couldn't find drag image",
								)
								const rect = image.getBoundingClientRect()
								event.dataTransfer.setDragImage(image, rect.width / 2, rect.height / 2)
								event.dataTransfer.setData(
									"text/plain",
									JSON.stringify(
										defineCanvasMapDropAction({
											type: "moveCharacter",
											characterId: character._id,
										}),
									),
								)
							}}
						>
							<UploadedImage
								id={character.imageId}
								emptyIcon={<Lucide.Ghost />}
								className="size-full data-[visible=false]:opacity-50"
								data-image
								data-visible={token.visible}
							/>
							{token.visible ? null : (
								<Lucide.EyeOff className="absolute inset-0 m-auto size-1/2" />
							)}
						</button>
					</Tooltip>
				</ContextMenu>
			))}
		</div>
	)
}

function isolateDraws(context: CanvasRenderingContext2D, fn: () => void) {
	context.save()
	fn()
	context.restore()
}

function toTranslateString(vector: Vector) {
	return `${vector.x}px ${vector.y}px`
}
