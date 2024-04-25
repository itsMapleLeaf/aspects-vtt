import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import * as React from "react"
import { z } from "zod"
import { Rect } from "#app/common/Rect.js"
import { expect } from "#app/common/expect.js"
import { mod } from "#app/common/math.js"
import { useResizeObserver } from "#app/common/useResizeObserver.js"
import { Vector, type VectorInput } from "#app/common/vector.js"
import { ContextMenu, type ContextMenuOption } from "#app/ui/ContextMenu.js"
import { api } from "#convex/_generated/api.js"
import type { Doc, Id } from "#convex/_generated/dataModel.js"
import type { Branded } from "#convex/helpers.js"
import type { ApiToken } from "#convex/scenes/tokens.js"
import { useImage } from "../../common/useImage.ts"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { getApiImageUrl } from "../images/getApiImageUrl.tsx"
import type { Camera } from "./Camera.tsx"
import type { CanvasMapController } from "./CanvasMapController.ts"
import { useRoom } from "./roomContext.tsx"

const canvasMapDropDataSchema = z.object({
	tokenKey: z.custom<Branded<"token">>().optional(),
	characterId: z.custom<Id<"characters">>().optional(),
})

export function defineCanvasMapDropData(input: z.output<typeof canvasMapDropDataSchema>) {
	return input
}

export function CanvasMap({
	scene,
	controller,
}: {
	scene: Doc<"scenes">
	controller: CanvasMapController
}) {
	const tokens = useQuery(api.scenes.tokens.list, { sceneId: scene._id })
	const addToken = useMutation(api.scenes.tokens.add)
	const updateToken = useMutation(api.scenes.tokens.update)

	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const backgroundImage = useImage(scene?.background && getApiImageUrl(scene.background))
	const { camera } = controller

	const draw = () => {
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

		if (controller.previewArea) {
			drawRect(context, controller.previewArea)
		}
	}

	function drawRect(context: CanvasRenderingContext2D, rect: Rect) {
		isolateDraws(context, () => {
			context.fillStyle = "white"
			context.strokeStyle = "white"
			context.lineWidth = 4
			context.lineJoin = "round"

			context.globalAlpha = 0.5
			context.fillRect(...rect.tuple)

			context.globalAlpha = 1
			context.strokeRect(...rect.tuple)
		})
	}

	React.useLayoutEffect(() => {
		draw()
	})

	useResizeObserver(canvasRef, (entry) => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		canvas.width = entry.contentRect.width
		canvas.height = entry.contentRect.height
		draw()
	})

	const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
		try {
			event.preventDefault()

			const action = canvasMapDropDataSchema.parse(
				JSON.parse(event.dataTransfer.getData("text/plain")),
			)

			const canvasRect = event.currentTarget.getBoundingClientRect()

			const position = Vector.from(event.clientX, event.clientY)
				.minus(canvasRect.left, canvasRect.top)
				.minus(camera.position)
				.dividedBy(camera.scale).rounded

			const existingToken = tokens?.find((it) => {
				if (action.characterId) {
					return it.characterId === action.characterId
				}
				if (action.tokenKey) {
					return it.key === action.tokenKey
				}
				return false
			})

			if (existingToken) {
				await updateToken({
					key: existingToken.key,
					sceneId: scene._id,
					characterId: action.characterId,
					position: position.xy,
				})
			} else {
				await addToken({
					characterId: action.characterId,
					sceneId: scene._id,
					position: position.xy,
					visible: false,
				})
			}
		} catch (error) {
			alert("Failed to update token, try again")
			console.error(error)
		}
	}

	const gridSizeToPixels = (...input: VectorInput) =>
		Vector.from(...input).times(scene.cellSize * camera.scale)

	return (
		<div
			{...controller.containerProps}
			className="relative size-full"
			onContextMenu={(event) => {
				event.preventDefault()
			}}
			onDragOver={(event) => {
				event.preventDefault()
				event.dataTransfer.dropEffect = "move"
			}}
			onDrop={handleDrop}
		>
			<canvas className="absolute inset-0 size-full" ref={canvasRef} />
			{tokens?.map((token) => (
				<TokenElement key={token.key} token={token} scene={scene} camera={camera}>
					{token.character && (
						<div style={gridSizeToPixels(1).toObject("width", "height")}>
							<UploadedImage
								id={token.character.imageId}
								emptyIcon={<Lucide.Ghost />}
								className="size-full"
							/>
						</div>
					)}
					{token.area && (
						<div
							className="rounded border-2 border-blue-500 bg-blue-500/25"
							style={Rect.fromCorners(
								Vector.from(token.position).floorTo(scene.cellSize),
								Vector.from(token.position)
									.plus(Vector.fromSize(token.area))
									.ceilingTo(scene.cellSize),
							)
								.size.times(camera.scale)
								.toObject("width", "height")}
						/>
					)}
				</TokenElement>
			))}
		</div>
	)
}

function isolateDraws(context: CanvasRenderingContext2D, fn: () => void) {
	context.save()
	fn()
	context.restore()
}

function TokenElement({
	token,
	scene,
	camera,
	children,
}: {
	token: ApiToken
	scene: Doc<"scenes">
	camera: Camera
	children: React.ReactNode
}) {
	const room = useRoom()
	const updateToken = useMutation(api.scenes.tokens.update)
	const removeToken = useMutation(api.scenes.tokens.remove)

	const translation = Vector.from(token.position)
		.floorTo(scene.cellSize)
		.times(camera.scale)
		.plus(camera.position)

	const menuOptions: ContextMenuOption[] = [
		{
			label: token.visible ? "Hide" : "Reveal",
			icon: token.visible ? <Lucide.EyeOff /> : <Lucide.Eye />,
			onClick() {
				return updateToken({
					key: token.key,
					sceneId: scene._id,
					visible: !token.visible,
				})
			},
		},
		{
			label: "Remove",
			icon: <Lucide.X />,
			onClick() {
				return removeToken({ tokenKey: token.key, sceneId: scene._id })
			},
		},
	]

	const handleDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
		const rect = event.currentTarget.getBoundingClientRect()
		event.dataTransfer.setDragImage(event.currentTarget, rect.width / 2, rect.height / 2)
		event.dataTransfer.setData(
			"text/plain",
			JSON.stringify(
				defineCanvasMapDropData({
					tokenKey: token.key,
					characterId: token.characterId,
				}),
			),
		)
	}

	return (
		<div
			className="absolute left-0 top-0 data-[visible=false]:opacity-50"
			data-visible={token.visible}
			style={{ translate: `${translation.x}px ${translation.y}px` }}
		>
			<ContextMenu key={token.key} disabled={!room.isOwner} options={menuOptions}>
				<button type="button" className="relative" draggable onDragStart={handleDragStart}>
					{children}
					{token.visible ? null : (
						<Lucide.EyeOff className="pointer-events-none absolute inset-0 m-auto size-1/2 max-h-32 max-w-32" />
					)}
				</button>
			</ContextMenu>
		</div>
	)
}
