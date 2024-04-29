import { useMutation, useQuery } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import * as React from "react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { Rect } from "../../common/Rect.ts"
import { hasItems } from "../../common/collection.ts"
import { expect } from "../../common/expect.ts"
import { clamp, mod } from "../../common/math.ts"
import { randomItem } from "../../common/random.ts"
import { useResizeObserver } from "../../common/useResizeObserver.ts"
import { Vector } from "../../common/vector.ts"
import { Menu, MenuItem, MenuPanel } from "../../ui/Menu.tsx"
import { api } from "../../../convex/_generated/api.js"
import type { Doc, Id } from "../../../convex/_generated/dataModel.js"
import type { Branded } from "../../../convex/helpers.ts"
import type { ApiToken } from "../../../convex/scenes/tokens.ts"
import { useImage } from "../../common/useImage.ts"
import { CharacterQuickMenu } from "../characters/CharacterQuickMenu.tsx"
import { useCharacterSelection } from "../characters/CharacterSelectionProvider.tsx"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { getApiImageUrl } from "../images/getApiImageUrl.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { useSceneContext } from "./SceneContext.tsx"
import type { ApiScene } from "./types.ts"

const sceneMapDropDataSchema = z.object({
	tokenKey: z.custom<Branded<"token">>().optional(),
	characterId: z.custom<Id<"characters">>().optional(),
})

export function defineSceneMapDropData(input: z.output<typeof sceneMapDropDataSchema>) {
	return input
}

export function SceneMap({ scene }: { scene: ApiScene }) {
	const tokens = useQuery(api.scenes.tokens.list, { sceneId: scene._id })

	function getCharacterTokenRect(token: { position: { x: number; y: number } }) {
		return new Rect(
			Vector.from(token.position).roundedTo(scene.cellSize),
			Vector.from(scene.cellSize),
		)
	}

	function getAreaTokenRect(
		position: { x: number; y: number },
		area: { width: number; height: number },
	): Rect {
		const base = new Rect(Vector.from(position), Vector.fromSize(area))
		return Rect.fromCorners(
			base.topLeft.floorTo(scene.cellSize),
			base.bottomRight.ceilingTo(scene.cellSize),
		)
	}

	return (
		<SceneMapContainer scene={scene}>
			<SceneMapBackground scene={scene} />

			{tokens
				?.sort((a, b) => {
					const rankA = a.character ? 1 : 0
					const rankB = b.character ? 1 : 0
					return rankA - rankB
				})
				.map((token) => (
					<React.Fragment key={token.key}>
						{token.character && (
							<MapElement token={token} rect={getCharacterTokenRect(token)}>
								<UploadedImage
									id={token.character.imageId}
									emptyIcon={<Lucide.Ghost />}
									className="size-full"
									imageClassName="rounded object-cover object-top shadow-md [transform:translateZ(0)]"
								/>
								<CharacterQuickMenu character={token.character} />
							</MapElement>
						)}
						{token.area && (
							<MapElement token={token} rect={getAreaTokenRect(token.position, token.area)}>
								<div className="size-full rounded border-2 border-blue-500 bg-blue-500/25" />
							</MapElement>
						)}
					</React.Fragment>
				))}

			{Iterator.from(tokens ?? [])
				.map((token) => token.character && { token, character: token.character })
				.filter((it) => it != null)
				.map(({ token, character }) => (
					<MapElement key={token.key} token={token} rect={getCharacterTokenRect(token)}>
						<div className="flex-center absolute inset-x-0 bottom-full justify-end gap-1.5 pb-2">
							<Meter
								value={character.damage / character.damageThreshold}
								className={{
									base: "text-green-400",
									warning: "text-yellow-400",
									danger: "text-red-400",
								}}
							/>
							<Meter
								value={character.fatigue / character.fatigueThreshold}
								className={{
									base: "text-sky-400",
									warning: "text-indigo-400",
									danger: "text-violet-400",
								}}
							/>
						</div>
					</MapElement>
				))
				.toArray()}

			{Iterator.from(tokens ?? [])
				.map((token) => token.character && { token, character: token.character })
				.filter((it) => it != null)
				.map(({ token, character }) => (
					<MapElement key={token.key} token={token} rect={getCharacterTokenRect(token)}>
						<TokenLabel text={character.displayName} subText={character.displayPronouns} />
					</MapElement>
				))
				.toArray()}

			<TokenMenu scene={scene} />
		</SceneMapContainer>
	)
}

function Meter({
	value,
	className,
}: { value: number; className: { base: string; warning: string; danger: string } }) {
	return (
		<div
			aria-hidden
			className={twMerge(
				"h-2.5 w-16 rounded-sm border border-current shadow shadow-black/50 relative transition-all",
				value < 0.5 ? className.base : value < 0.8 ? className.warning : className.danger,
				value > 0 ? "opacity-100 visible" : "opacity-0 invisible",
			)}
		>
			<div
				className="absolute inset-0 origin-left bg-current transition-[scale]"
				style={{ scale: `${clamp(value, 0, 1)} 1` }}
			/>
			<div className="absolute inset-0 bg-current opacity-25" />
		</div>
	)
}

function TokenLabel(props: { text: string; subText: string }) {
	return (
		<>
			<div className="peer absolute inset-0" />
			<div className="flex-center absolute inset-x-0 top-full translate-y-2 opacity-0 transition-opacity peer-hover:opacity-100">
				<div className="flex-center whitespace-nowrap rounded bg-black/50 px-2.5 py-2 text-center leading-none shadow shadow-black/50">
					<p>{props.text}</p>
					<p className="mt-0.5 text-sm/none opacity-75 empty:hidden">{props.subText}</p>
				</div>
			</div>
		</>
	)
}

function SceneMapContainer({
	scene,
	children,
}: { scene: Doc<"scenes">; children: React.ReactNode }) {
	const controller = useSceneContext()
	const tokens = useQuery(api.scenes.tokens.list, { sceneId: scene._id })
	const addToken = useMutation(api.scenes.tokens.add)
	const updateToken = useMutation(api.scenes.tokens.update)

	async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
		try {
			event.preventDefault()

			const action = sceneMapDropDataSchema.parse(
				JSON.parse(event.dataTransfer.getData("text/plain")),
			)

			const canvasRect = event.currentTarget.getBoundingClientRect()

			const position = Vector.from(event.clientX, event.clientY)
				.minus(canvasRect.left, canvasRect.top)
				.minus(controller.camera.position)
				.dividedBy(controller.camera.scale).rounded

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
			{children}
		</div>
	)
}

function SceneMapBackground({ scene }: { scene: Doc<"scenes"> }) {
	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const backgroundImage = useImage(scene.background && getApiImageUrl(scene.background))
	const { camera, ...controller } = useSceneContext()
	const multiSelectArea = controller.getMultiSelectArea()

	React.useLayoutEffect(() => {
		draw()
	})

	useResizeObserver(canvasRef, (entry) => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		canvas.width = entry.contentRect.width
		canvas.height = entry.contentRect.height
		draw()
	})

	function draw() {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		const context = expect(canvas.getContext("2d"), "canvas not supported")
		const cellSize = (scene?.cellSize ?? 0) * camera.scale

		context.clearRect(0, 0, canvas.width, canvas.height)

		if (backgroundImage) {
			isolateDraws(context, () => {
				context.globalAlpha = 0.75
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
				context.globalAlpha = 0.25

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

		if (multiSelectArea) {
			drawRect(context, multiSelectArea)
		}

		if (controller.previewArea) {
			drawRect(
				context,
				Rect.fromCorners(
					controller.previewArea.topLeft
						.minus(camera.position)
						.floorTo(cellSize)
						.plus(camera.position),
					controller.previewArea.bottomRight
						.minus(camera.position)
						.ceilingTo(cellSize)
						.plus(camera.position),
				),
			)
		}
	}

	function drawRect(context: CanvasRenderingContext2D, rect: Rect) {
		isolateDraws(context, () => {
			context.fillStyle = "white"
			context.strokeStyle = "white"
			context.lineWidth = 2
			context.lineJoin = "round"

			context.globalAlpha = 0.5
			context.fillRect(...rect.tuple)

			context.globalAlpha = 1
			context.strokeRect(...rect.tuple)
		})
	}

	function isolateDraws(context: CanvasRenderingContext2D, fn: () => void) {
		context.save()
		fn()
		context.restore()
	}

	return <canvas className="absolute inset-0 size-full" ref={canvasRef} />
}

function MapElement({
	token,
	rect,
	children,
}: {
	token: ApiToken
	rect: Rect
	children: React.ReactNode
}) {
	const controller = useSceneContext()
	const isSelected = controller.selectedTokens().some((it) => it.key === token.key)

	const transformed = rect
		.withPosition(rect.position.times(controller.camera.scale).plus(controller.camera.position))
		.scaledBy(controller.camera.scale)
		.translated((isSelected && controller.tokenMovement) || Vector.zero)

	return (
		<div
			className="absolute left-0 top-0 select-none rounded outline outline-2 outline-transparent data-[visible=false]:opacity-50 data-[selected=true]:outline-primary-700"
			data-visible={token.visible}
			data-token-key={token.key}
			data-selected={isSelected}
			style={{
				translate: `${transformed.x}px ${transformed.y}px`,
				width: transformed.width,
				height: transformed.height,
			}}
		>
			{children}
			{token.visible ? null : (
				<Lucide.EyeOff className="pointer-events-none absolute inset-0 m-auto size-1/2 max-h-32 max-w-32" />
			)}
		</div>
	)
}

function TokenMenu({ scene }: { scene: Doc<"scenes"> }) {
	const room = useRoom()
	const controller = useSceneContext()
	const { tokenMenu } = controller
	const updateToken = useMutation(api.scenes.tokens.update)
	const removeToken = useMutation(api.scenes.tokens.remove)
	const characterSelection = useCharacterSelection()

	if (!room.isOwner) {
		return null
	}

	if (!tokenMenu) {
		return null
	}

	const tokensWithVisibility = (visible: boolean) =>
		controller.selectedTokens().filter((it) => it.visible === visible)

	const singleSelectedCharacter = (() => {
		const [first, ...rest] = controller.selectedCharacters().take(2).toArray()
		if (first && rest.length === 0) {
			return first
		}
	})()

	return (
		<Menu
			open
			setOpen={(open) => {
				if (open === false) controller.closeTokenMenu()
			}}
		>
			<MenuPanel modal getAnchorRect={() => tokenMenu.screenPosition}>
				{singleSelectedCharacter && (
					<MenuItem
						text="View Profile"
						icon={<Lucide.Search />}
						onClick={() => {
							characterSelection.setSelected(singleSelectedCharacter._id)
						}}
					/>
				)}
				{hasItems(tokensWithVisibility(false)) && (
					<MenuItem
						text="Show"
						icon={<Lucide.Eye />}
						onClick={() => {
							for (const token of tokensWithVisibility(false)) {
								updateToken({
									key: token.key,
									sceneId: scene._id,
									visible: true,
								})
							}
						}}
					/>
				)}
				{hasItems(tokensWithVisibility(true)) && (
					<MenuItem
						text="Hide"
						icon={<Lucide.EyeOff />}
						onClick={() => {
							for (const token of tokensWithVisibility(true)) {
								updateToken({
									key: token.key,
									sceneId: scene._id,
									visible: false,
								})
							}
						}}
					/>
				)}
				{controller.selectedTokens().take(2).count() > 1 && (
					<MenuItem
						text="Choose random"
						icon={<Lucide.Dices />}
						onClick={() => {
							const result = randomItem(controller.selectedCharacters().toArray())
							if (result) {
								controller.selectCharacter(result._id)
							}
						}}
					/>
				)}
				<MenuItem
					text="Remove"
					icon={<Lucide.X />}
					onClick={() => {
						for (const token of controller.selectedTokens()) {
							removeToken({ tokenKey: token.key, sceneId: scene._id })
						}
					}}
				/>
			</MenuPanel>
		</Menu>
	)
}
