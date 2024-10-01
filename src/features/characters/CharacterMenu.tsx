import { LucideEdit } from "lucide-react"
import { ComponentProps, useState } from "react"
import { match, P } from "ts-pattern"
import { Button } from "~/components/Button.tsx"
import { Popover } from "~/components/Popover.tsx"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterAttributeButtonRow } from "~/features/characters/CharacterAttributeButtonRow.tsx"
import { CharacterEditorDialog } from "~/features/characters/CharacterEditorDialog.tsx"
import { CharacterToggleCombatMemberButton } from "~/features/characters/CharacterToggleCombatMemberButton.tsx"
import { CharacterVitalFields } from "~/features/characters/CharacterVitalFields.tsx"
import { ApiCharacter } from "~/features/characters/types.ts"
import { List } from "~/shared/list.ts"
import { useRoomContext } from "../rooms/context.tsx"
import { CharacterToggleTokenButton } from "./CharacterToggleTokenButton.tsx"

export type CharacterMenuController = ReturnType<
	typeof useCharacterMenuController
>

export function useCharacterMenuController() {
	const [open, setOpen] = useState(false)
	const [characters, setCharacters] = useState(List.of<ApiCharacter>())
	const [position, setPosition] = useState<{ x: number; y: number }>()
	return {
		position,
		open,
		characters,
		show(event: { x: number; y: number }, characters: Iterable<ApiCharacter>) {
			setCharacters(List.from(characters))
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
	const [editorOpen, setEditorOpen] = useState(false)

	const [editingCharacter, setEditingCharacter] =
		useState<NormalizedCharacter>()

	const items = match([...controller.characters])
		.with([], () => [])
		.with([P._], ([character]) => [
			character.full && (
				<CharacterAttributeButtonRow
					key="attributes"
					character={character.full}
				/>
			),
			character.full && (
				<CharacterVitalFields
					key="vitals"
					className="w-[220px] gap"
					character={character.full}
				/>
			),
			/* <Button asChild icon={<LucideSwords />} align="start">
            <Popover.Close>Attack</Popover.Close>
        </Button>, */
			character.full && (
				<Button key="edit" asChild icon={<LucideEdit />}>
					<Popover.Close
						onClick={() => {
							setEditingCharacter(character.full)
							setEditorOpen(true)
						}}
					>
						Edit
					</Popover.Close>
				</Button>
			),
			room.isOwner && (
				<Popover.Close
					key="combat"
					render={
						<CharacterToggleCombatMemberButton characterIds={[character._id]} />
					}
				/>
			),
			room.isOwner && (
				<Popover.Close
					key="token"
					render={<CharacterToggleTokenButton characterIds={[character._id]} />}
				/>
			),
		])
		.otherwise((characters) => [
			/* <Button asChild icon={<LucideSwords />} align="start">
					<Popover.Close>Attack</Popover.Close>
				</Button>, */
			<CharacterToggleCombatMemberButton
				key="combat"
				characterIds={characters.map((it) => it._id)}
			/>,
			room.isOwner && (
				<Popover.Close
					key="token"
					render={
						<CharacterToggleTokenButton
							characterIds={characters.map((it) => it._id)}
						/>
					}
				/>
			),
		])
		.filter(Boolean)

	if (items.length === 0) {
		return null
	}

	return (
		<Popover.Root placement="bottom-start" open={controller.open} {...props}>
			<Popover.Content
				getAnchorRect={() => controller.position ?? null}
				className="flex flex-col p-gap gap-2"
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
		</Popover.Root>
	)
}
