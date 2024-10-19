import { useMutation, useQuery } from "convex/react"
import { LucideEdit, LucideSwords } from "lucide-react"
import { ComponentProps, useState } from "react"
import { match, P } from "ts-pattern"
import { Button } from "~/components/Button.tsx"
import { Popover } from "~/components/Popover.tsx"
import { api } from "~/convex/_generated/api.js"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterAttributeButtonRow } from "~/features/characters/CharacterAttributeButtonRow.tsx"
import { CharacterEditorDialog } from "~/features/characters/CharacterEditorDialog.tsx"
import { CharacterToggleCombatMemberButton } from "~/features/characters/CharacterToggleCombatMemberButton.tsx"
import { CharacterVitalFields } from "~/features/characters/CharacterVitalFields.tsx"
import { ApiCharacter } from "~/features/characters/types.ts"
import { List } from "~/shared/list.ts"
import { Checkbox } from "../../components/Checkbox.tsx"
import { panel } from "../../styles/panel.ts"
import { useRoomContext } from "../rooms/context.tsx"
import { useActiveSceneContext } from "../scenes/context.ts"
import { CharacterAttackDialog } from "./CharacterAttackDialog.tsx"
import { CharacterToggleTokenButton } from "./CharacterToggleTokenButton.tsx"

export type CharacterMenuController = ReturnType<
	typeof useCharacterMenuController
>

export function useCharacterMenuController() {
	const [open, setOpen] = useState(false)
	const [characterIds, setCharacterIds] = useState(
		List.of<ApiCharacter["_id"]>(),
	)
	const [position, setPosition] = useState<{ x: number; y: number }>()

	const scene = useActiveSceneContext()
	const tokens =
		useQuery(api.tokens.list, scene ? { sceneId: scene._id } : "skip") ?? []

	const tokensByCharacterId = new Map(tokens.map((it) => [it.characterId, it]))

	return {
		position,
		open,
		characterTokens: characterIds
			.map((id) => tokensByCharacterId.get(id))
			.compact(),
		show(
			event: { x: number; y: number },
			characterIds: Iterable<ApiCharacter["_id"]>,
		) {
			setCharacterIds(List.from(characterIds))
			setPosition({ x: event.x, y: event.y })
			setOpen(true)
		},
		hide() {
			setOpen(false)
		},
	}
}

export function CharacterMenu({
	controller,
	...props
}: ComponentProps<typeof Popover.Root> & {
	controller: CharacterMenuController
}) {
	const room = useRoomContext()

	const items = match([...controller.characterTokens])
		.with(
			[{ character: { full: P.nonNullable } }],
			([{ character, ...token }]) => [
				room.isOwner && (
					<Checkbox
						key="tokenVisible"
						label="Token visible"
						checked={token.visible}
						onChange={async (visible) => {
							await updateToken({
								updates: [{ tokenId: token._id, visible }],
							})
						}}
					/>
				),
				<CharacterAttributeButtonRow
					key="attributes"
					characters={[character.full]}
				/>,
				<CharacterVitalFields
					key="vitals"
					className="w-[220px] gap"
					character={character.full}
				/>,
				<Popover.Close
					key="attack"
					render={<Button icon={<LucideSwords />} />}
					onClick={() => {
						setAttackingCharacterIds(new Set([character._id]))
						setAttackOpen(true)
					}}
				>
					Attack
				</Popover.Close>,
				<Button key="edit" asChild icon={<LucideEdit />}>
					<Popover.Close
						onClick={() => {
							setEditingCharacterId(character._id)
							setEditorOpen(true)
						}}
					>
						Edit
					</Popover.Close>
				</Button>,
				room.isOwner && (
					<Popover.Close
						key="combat"
						render={
							<CharacterToggleCombatMemberButton
								characters={[character.full]}
							/>
						}
					/>
				),
				room.isOwner && (
					<Popover.Close
						key="token"
						render={
							<CharacterToggleTokenButton characters={[character.full]} />
						}
					/>
				),
			],
		)
		.otherwise((tokens) => {
			const characters = tokens.map((it) => it.character)
			const fullCharacters = characters.map((it) => it.full).filter(Boolean)

			return [
				fullCharacters.length > 0 && (
					<CharacterAttributeButtonRow
						key="attributes"
						characters={fullCharacters}
					/>
				),
				<Popover.Close
					key="attack"
					render={<Button icon={<LucideSwords />} />}
					onClick={() => {
						setAttackingCharacterIds(new Set(characters.map((it) => it._id)))
						setAttackOpen(true)
					}}
				>
					Attack
				</Popover.Close>,
				fullCharacters.length > 0 && room.isOwner && (
					<CharacterToggleCombatMemberButton
						key="combat"
						characters={fullCharacters}
					/>
				),
				fullCharacters.length > 0 && room.isOwner && (
					<Popover.Close
						key="token"
						render={<CharacterToggleTokenButton characters={fullCharacters} />}
					/>
				),
			]
		})
		.filter(Boolean)

	const [editorOpen, setEditorOpen] = useState(false)
	const [editingCharacterId, setEditingCharacterId] =
		useState<NormalizedCharacter["_id"]>()

	const editingCharacter = controller.characterTokens
		.map((it) => it.character.full)
		.find((it) => it?._id === editingCharacterId)

	const [attackOpen, setAttackOpen] = useState(false)
	const [attackingCharacterIds, setAttackingCharacterIds] =
		useState<Set<NormalizedCharacter["_id"]>>()

	const attackingCharacters =
		attackingCharacterIds &&
		controller.characterTokens
			.filter((it) => attackingCharacterIds?.has(it.characterId))
			.map((it) => it.character)

	const updateToken = useMutation(api.tokens.update)

	if (items.length === 0) {
		return null
	}

	return (
		<Popover.Root placement="bottom-start" open={controller.open} {...props}>
			<Popover.Content
				getAnchorRect={() => controller.position ?? null}
				className={panel("grid rounded-xl p-2 gap-2")}
				onClose={controller.hide}
			>
				{items}
			</Popover.Content>
			{editingCharacter && (
				<CharacterEditorDialog
					character={editingCharacter}
					open={editorOpen}
					setOpen={setEditorOpen}
				/>
			)}
			{attackingCharacters?.length ? (
				<CharacterAttackDialog
					characters={attackingCharacters}
					open={attackOpen}
					setOpen={setAttackOpen}
				/>
			) : null}
		</Popover.Root>
	)
}
