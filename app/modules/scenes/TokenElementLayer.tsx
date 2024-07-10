import { useGesture } from "@use-gesture/react"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import type { ApiToken } from "../../../convex/scenes/tokens/functions.ts"
import { sortBy } from "../../helpers/iterable.ts"
import { Vector } from "../../helpers/Vector.ts"
import { CharacterImage } from "../characters/CharacterImage.tsx"
import { CharacterModal } from "../characters/CharacterModal.tsx"
import type { ApiCharacter } from "../characters/types.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { getColorStyle, type UserColorName } from "../user-colors/data.ts"
import { DistanceLabelLayer, DistanceLayer } from "./DistanceLayer.tsx"
import { PingLayer } from "./PingLayer.tsx"
import { useSceneContext } from "./SceneContext.tsx"
import { TokenLabel } from "./TokenLabel.tsx"
import { TokenMeter } from "./TokenMeter.tsx"
import { useUpdateTokenMutation } from "./useUpdateTokenMutation.tsx"

export function TokenElementLayer() {
	const { viewport, tokens } = useSceneContext()
	const room = useRoom()
	return (
		<div
			className="absolute left-0 top-0 origin-top-left"
			style={{ translate: viewport.offset.css.translate() }}
		>
			<DistanceLayer />
			{/* sort so characters are last and are on top of everything else */}
			{sortBy(tokens, (it) => (it.character ? 1 : 0)).map((token) => (
				<TokenElement
					token={token}
					isCurrentCombatMember={
						token.character?._id === room.combat?.currentMemberId &&
						room.combat?.currentMemberId != null
					}
					key={token.key}
				/>
			))}
			<PingLayer />
			{tokens.map((token) =>
				token.character ?
					<CharacterTokenDecoration key={token.key} token={token} character={token.character} />
				:	null,
			)}
			{tokens.map((token) =>
				token.area ? <AreaSizeLabel key={token.key} token={token} area={token.area} /> : null,
			)}
			<DistanceLabelLayer />
		</div>
	)
}

function TokenElement({
	token,
	isCurrentCombatMember,
}: {
	token: ApiToken
	isCurrentCombatMember: boolean
}) {
	const {
		scene: { cellSize },
		viewport,
		tokens,
		tokenSelectStore,
		tokenDragOffset,
		setTokenDragOffset,
	} = useSceneContext()

	const { currentScene } = useRoom()

	const translate = useTokenTranslate(token)
	const updateToken = useUpdateTokenMutation()

	function updateSelectedTokenPositions() {
		if (!currentScene) return
		for (const token of tokens) {
			if (!tokenSelectStore.isSelected(token.key)) continue

			const position = Vector.from(token.position).roundedTo(cellSize).plus(tokenDragOffset).xy

			updateToken({
				sceneId: currentScene,
				key: token.key,
				position,
			})
		}
	}

	const bind = useGesture(
		{
			onDrag: (state) => {
				setTokenDragOffset(Vector.from(state.movement))
			},
			onDragEnd: () => {
				updateSelectedTokenPositions()
				setTokenDragOffset(Vector.zero)
			},
		},
		{
			drag: {
				from: [0, 0],
			},
			transform: (input) => [
				...Vector.from(input).minus(viewport.offset).dividedBy(viewport.scale).tuple,
			],
		},
	)

	const [characterModalOpen, setCharacterModalOpen] = useState(false)

	return (
		<>
			<div
				{...bind()}
				data-hidden={!token.visible || undefined}
				className="absolute left-0 top-0 origin-top-left touch-none data-[hidden]:opacity-75"
				style={{ translate }}
				onDoubleClick={() => {
					if (!token.character) return
					setCharacterModalOpen(true)
				}}
			>
				<div {...tokenSelectStore.selectableProps(token.key)} className="group relative">
					<div
						data-is-current-combat-member={isCurrentCombatMember}
						className="pointer-events-none absolute inset-0 animate-pulse rounded outline-dashed outline-4 outline-offset-[6px] outline-transparent data-[is-current-combat-member=true]:outline-primary-700"
					></div>
					{token.character && (
						<CharacterImage
							character={token.character}
							style={Vector.from(cellSize).times(viewport.scale).toSize()}
							className={{
								container: "overflow-clip rounded bg-primary-300 shadow-md",
								image: "object-cover object-top",
							}}
						/>
					)}
					{token.area && (
						<div
							className="rounded border-4 border-blue-500 bg-blue-500/30"
							style={Vector.fromSize(token.area).roundedTo(cellSize).times(viewport.scale).toSize()}
						/>
					)}
					{token.visible ? null : (
						<div className="flex-center absolute inset-0">
							<Lucide.EyeOff className="size-2/3 opacity-50" />
						</div>
					)}
					<div className="pointer-events-none absolute inset-0 rounded bg-primary-600/25 opacity-0 outline outline-4 outline-primary-700 group-data-[selected]:opacity-100" />
				</div>
			</div>

			{token.character && (
				<CharacterModal
					open={characterModalOpen}
					setOpen={setCharacterModalOpen}
					character={token.character}
				/>
			)}
		</>
	)
}

function CharacterTokenDecoration({
	token,
	character,
}: {
	token: ApiToken
	character: ApiCharacter
}) {
	const {
		scene: { cellSize },
		viewport,
	} = useSceneContext()
	const translate = useTokenTranslate(token)
	return (
		<div
			className="pointer-events-none absolute left-0 top-0 origin-top-left"
			style={{ translate }}
		>
			<div className="relative" style={Vector.from(cellSize).times(viewport.scale).toSize()}>
				<div className="flex-center absolute inset-x-0 bottom-full gap-1.5 pb-2">
					{character.conditions.map((condition) => (
						<CharacterTokenConditionBadge key={condition.name} condition={condition} />
					))}
					{character.health !== undefined && character.health <= 0 && (
						<CharacterTokenConditionBadge condition={{ name: "Incapacitated", color: "red" }} />
					)}
					{character.resolve !== undefined && character.resolve <= 0 && (
						<CharacterTokenConditionBadge condition={{ name: "Exhausted", color: "purple" }} />
					)}
					{character.health != null &&
						character.healthMax != null &&
						character.health < character.healthMax && (
							<TokenMeter
								value={character.health / character.healthMax}
								className={{
									base: "text-green-400",
									warning: "text-green-400",
									danger: "text-red-400",
								}}
							/>
						)}
					{character.resolve != null &&
						character.resolveMax != null &&
						character.resolve < character.resolveMax && (
							<TokenMeter
								value={character.resolve / character.resolveMax}
								className={{
									base: "text-blue-400",
									warning: "text-blue-400",
									danger: "text-purple-400",
								}}
							/>
						)}
				</div>
				<TokenLabel text={character.name ?? "???"} subText={character.pronouns} />
			</div>
		</div>
	)
}

function CharacterTokenConditionBadge({
	condition,
}: {
	condition: { name: string; color: UserColorName }
}) {
	return (
		<p
			className={twMerge(
				getColorStyle(condition.color),
				"flex-center-row h-6 rounded px-1.5 text-sm leading-none",
			)}
		>
			{condition.name}
		</p>
	)
}

function AreaSizeLabel({ token, area }: { token: ApiToken; area: NonNullable<ApiToken["area"]> }) {
	const {
		scene: { cellSize },
		viewport,
	} = useSceneContext()
	const translate = useTokenTranslate(token)
	const dimensions = Vector.fromSize(area).dividedBy(cellSize).rounded
	return (
		<div
			className="flex-center pointer-events-none absolute left-0 top-0 origin-top-left"
			style={{
				...Vector.fromSize(area).roundedTo(cellSize).toSize(),
				scale: viewport.scale,
				translate,
			}}
		>
			<p className="rounded-lg bg-black p-3 text-3xl/none font-bold text-white opacity-50">
				{dimensions.x}x{dimensions.y}
			</p>
		</div>
	)
}

function useTokenTranslate(token: ApiToken) {
	const {
		scene: { cellSize },
		viewport,
		tokenSelectStore,
		tokenDragOffset,
	} = useSceneContext()
	const isSelected = tokenSelectStore.isSelected(token.key)
	return Vector.from(token.position)
		.roundedTo(cellSize)
		.times(viewport.scale)
		.plus(isSelected ? tokenDragOffset.times(viewport.scale) : Vector.zero)
		.css.translate()
}
