import { useMutation, useQuery } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import * as React from "react"
import { z } from "zod"
import { api } from "../../../convex/_generated/api.js"
import type { Doc, Id } from "../../../convex/_generated/dataModel.js"
import type { Branded } from "../../../convex/helpers.ts"
import type { ApiToken } from "../../../convex/scenes/tokens.ts"
import { Rect } from "../../common/Rect.ts"
import { hasItems } from "../../common/collection.ts"
import { randomItem } from "../../common/random.ts"
import { Vector } from "../../common/vector.ts"
import { Menu, MenuItem, MenuPanel } from "../../ui/Menu.tsx"
import { CharacterQuickMenu } from "../characters/CharacterQuickMenu.tsx"
import { useCharacterSelection } from "../characters/CharacterSelectionProvider.tsx"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { useSceneContext } from "./SceneContext.tsx"
import { SceneMapBackground } from "./SceneMapBackground.tsx"
import { TokenLabel, TokenMeter } from "./tokens.tsx"
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
									className={{
										container: "size-full",
										image: "rounded object-cover object-top shadow-md [transform:translateZ(0)]",
									}}
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
							<TokenMeter
								value={character.damage / character.damageThreshold}
								className={{
									base: "text-green-400",
									warning: "text-yellow-400",
									danger: "text-red-400",
								}}
							/>
							<TokenMeter
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
		.withPosition(rect.topLeft.times(controller.camera.scale).plus(controller.camera.position))
		.scale(controller.camera.scale)
		.move((isSelected && controller.tokenMovement) || Vector.zero)

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
