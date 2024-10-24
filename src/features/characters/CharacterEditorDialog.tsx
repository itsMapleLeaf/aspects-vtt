import { useQuery } from "convex/react"
import { ComponentProps, useState } from "react"
import { Dialog } from "~/components/Dialog.tsx"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import { useRoomContext } from "~/features/rooms/context.tsx"
import { CharacterEditor } from "./CharacterEditor.tsx"

export { Button as CharacterEditorDialogButton } from "~/components/Dialog.tsx"

export function CharacterEditorDialog({
	children,
	character,
	...props
}: ComponentProps<typeof Dialog.Root> & {
	character: NormalizedCharacter
}) {
	return (
		<Dialog.Root {...props}>
			{children}

			<Dialog.Content
				title={character.name}
				description="Edit character details"
				className="h-[1000px] max-w-xl"
			>
				<div className="min-h-0 flex-1">
					<CharacterEditor character={character} />
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

	const element = editingCharacter?.full && (
		<CharacterEditorDialog
			character={editingCharacter.full}
			open={editorOpen}
			setOpen={setEditorOpen}
		/>
	)

	return { show, hide, element }
}
