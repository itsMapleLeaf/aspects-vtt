import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import * as React from "react"
import { z } from "zod"
import { expect } from "#app/common/expect.js"
import { mod } from "#app/common/math.js"
import { useObservable } from "#app/common/observable.js"
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
import { Camera } from "./Camera.tsx"
import { useRoom } from "./roomContext.tsx"
import { AreaToolEnabled } from "./state.ts"

const canvasMapDropDataSchema = z.object({
	tokenKey: z.custom<Branded<"token">>().optional(),
	characterId: z.custom<Id<"characters">>().optional(),
})

export function defineCanvasMapDropData(input: z.output<typeof canvasMapDropDataSchema>) {
	return input
}

export function CanvasMap({ scene }: { scene: Doc<"scenes"> }) {
	const areaToolEnabled = useObservable(AreaToolEnabled)
	const [areaStart, setAreaStart] = React.useState<Vector>()

	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const backgroundImage = useImage(scene?.background && getApiImageUrl(scene.background))
	const [camera, setCamera] = React.useState(new Camera())
	const mapCursorRef = React.useRef(Vector.zero)

	const tokens = useQuery(api.scenes.tokens.list, { sceneId: scene._id })
	const addToken = useMutation(api.scenes.tokens.add)
	const updateToken = useMutation(api.scenes.tokens.update)

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

		if (areaToolEnabled) {
			isolateDraws(context, () => {
				const a = mapCursorRef.current
				const b = areaStart ?? mapCursorRef.current

				const topLeft = Vector.topLeftMost(a, b)
				const bottomRight = Vector.bottomRightMost(a, b)

				const position = topLeft
					.floorTo(scene?.cellSize ?? 0)
					.times(camera.scale)
					.plus(camera.position)

				const size = topLeft
					.floorTo(scene?.cellSize ?? 0)
					.minus(bottomRight.ceilingTo(scene?.cellSize ?? 0))
					.abs.times(camera.scale)

				context.fillStyle = "white"
				context.strokeStyle = "white"
				context.lineWidth = 4
				context.lineJoin = "round"

				context.globalAlpha = 0.5
				context.fillRect(...position.tuple, ...size.tuple)

				context.globalAlpha = 1
				context.strokeRect(...position.tuple, ...size.tuple)
			})
		}
	}, [scene?.cellSize, backgroundImage, camera, areaToolEnabled, areaStart])

	React.useEffect(() => {
		draw()
	}, [draw])

	useResizeObserver(canvasRef, (entry) => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		canvas.width = entry.contentRect.width
		canvas.height = entry.contentRect.height
		draw()
	})

	const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (areaToolEnabled) {
			mapCursorRef.current = windowCoordsToMapCoords(Vector.from(event.clientX, event.clientY))
			draw()
		}
	}

	const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (areaToolEnabled && event.button === 0) {
			setAreaStart(windowCoordsToMapCoords(Vector.from(event.clientX, event.clientY)))
			return
		}

		captureDrag(event, 2, (event) => {
			setCamera((camera) => camera.movedBy(event.movementX, event.movementY))
		})
	}

	const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (areaToolEnabled && event.button === 0) {
			setAreaStart(undefined)
		}
	}

	function windowCoordsToMapCoords(windowCoords: Vector): Vector {
		const canvasRect = canvasRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 }
		return windowCoords
			.minus(canvasRect.left, canvasRect.top)
			.minus(camera.position)
			.dividedBy(camera.scale)
	}

	function captureDrag(
		event: { button: number; preventDefault(): void },
		button: number,
		handleMove: (event: PointerEvent) => void,
		onFinish?: () => void,
	) {
		if (event.button !== button) {
			return false
		}

		event.preventDefault()

		const handleContextMenu = (event: Event) => {
			event.preventDefault()
		}

		const handleUp = (event: PointerEvent | FocusEvent) => {
			const isUp = event instanceof FocusEvent || event.button === button
			if (!isUp) return

			event.preventDefault()
			onFinish?.()

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

		return true
	}

	const handleDrop = async (event: React.DragEvent<HTMLCanvasElement>) => {
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
				})
			}
		} catch (error) {
			alert("Failed to update token, try again")
			console.error(error)
		}
	}

	const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
		const delta = Math.sign(event.deltaY)
		if (delta === 0) return

		const rect = event.currentTarget.getBoundingClientRect()

		const pivot = Vector.from(event.clientX, event.clientY)
			.minus(rect.left, rect.top)
			.minus(camera.position)

		setCamera((camera) => camera.zoomedBy(delta * -1, pivot))
	}

	const gridSizeToPixels = (...input: VectorInput) =>
		Vector.from(...input).times(scene.cellSize * camera.scale)

	return (
		<div className="relative size-full">
			<canvas
				className="absolute inset-0 size-full"
				ref={canvasRef}
				onContextMenu={(event) => {
					event.preventDefault()
				}}
				onPointerMove={handlePointerMove}
				onPointerDown={handlePointerDown}
				onPointerUp={handlePointerUp}
				onWheel={handleWheel}
				onDragOver={(event) => {
					event.preventDefault()
					event.dataTransfer.dropEffect = "move"
				}}
				onDrop={handleDrop}
			/>
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
