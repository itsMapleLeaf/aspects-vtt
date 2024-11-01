import { useQuery } from "convex/react"
import { ComponentProps, useState } from "react"
import { Dialog } from "~/components/Dialog.tsx"
import { Field } from "~/components/Field.tsx"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import type {
	NormalizedCharacter,
	ProtectedCharacter,
} from "~/convex/characters.ts"
import { useRoomContext } from "~/features/rooms/context.tsx"
import { panel } from "~/styles/panel.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { CharacterEditor } from "./CharacterEditor.tsx"
import { CharacterName } from "./CharacterName.tsx"
import { RaceAbilityList } from "./RaceAbilityList.tsx"

export { Button as CharacterEditorDialogButton } from "~/components/Dialog.tsx"

export function CharacterEditorDialog({
	children,
	character,
	afterClone,
	...props
}: ComponentProps<typeof Dialog.Root> & {
	character: NormalizedCharacter
	afterClone: (characterId: Id<"characters">) => void
}) {
	return (
		<Dialog.Root {...props}>
			{children}
			<Dialog.Content
				title={character.name}
				description="Editing character"
				className="max-w-[600px]"
			>
				<div className="-m-3 h-[960px] max-h-[calc(100vh-4rem)] overflow-y-auto px-2 pb-2">
					<CharacterEditor character={character} afterClone={afterClone} />
				</div>
			</Dialog.Content>
		</Dialog.Root>
	)
}

export function useCharacterEditorDialog() {
	const room = useRoomContext()
	const characters = useQuery(api.characters.list, { roomId: room._id })

	const [editorOpen, setEditorOpen] = useState(false)
	const [editingCharacterId, setEditingCharacterId] =
		useState<Id<"characters">>()
	const editingCharacter = characters?.find(
		(it) => it._id === editingCharacterId,
	)

	const show = (characterId: Id<"characters">) => {
		setEditingCharacterId(characterId)
		setEditorOpen(true)
	}

	const hide = () => {
		setEditorOpen(false)
	}

	const element = editingCharacter?.full ? (
		<CharacterEditorDialog
			character={editingCharacter.full}
			open={editorOpen}
			setOpen={setEditorOpen}
			afterClone={setEditingCharacterId}
		/>
	) : editingCharacter ? (
		<Dialog.Root open={editorOpen} setOpen={setEditorOpen}>
			<Dialog.Content
				title={<CharacterName character={editingCharacter} />}
				className="overflow-y-scroll"
			>
				<CharacterPublicProfile character={editingCharacter} />
			</Dialog.Content>
		</Dialog.Root>
	) : null

	return { show, hide, element }
}

function CharacterPublicProfile({
	character,
}: {
	character: ProtectedCharacter
}) {
	return (
		<div className="flex h-fit max-h-[calc(100vh-8rem)] flex-col gap">
			{character.imageId && (
				<img
					src={getImageUrl(character.imageId)}
					alt=""
					className={panel("min-h-0 flex-1 bg-primary-900 object-contain")}
				/>
			)}
			<div className="grid auto-cols-fr grid-flow-col gap empty:hidden">
				{character.race && <Field label="Race">{character.race}</Field>}
				{character.pronouns && (
					<Field label="Pronouns">{character.pronouns}</Field>
				)}
			</div>
			{character.race && (
				<Field label="Abilities">
					<RaceAbilityList race={character.race} />
				</Field>
			)}
		</div>
	)
}
