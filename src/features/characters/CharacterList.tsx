import { useMutation, useQuery } from "convex/react"
import { LucideUserRoundPlus, LucideUserX2 } from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import { Button } from "~/components/Button.tsx"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { CharacterEditorDialog } from "~/features/characters/CharacterEditorDialog.tsx"
import { SearchListLayout } from "../inventory/SearchListLayout.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { CharacterCard } from "./CharacterCard.tsx"

export function CharacterList() {
	const room = useRoomContext()
	const characters = useQuery(api.characters.list, {
		roomId: room._id,
	})
	const [search, setSearch] = useState("")
	const [editorOpen, setEditorOpen] = useState(false)
	const createCharacter = useMutation(api.characters.create)
	const [editingCharacterId, setEditingCharacterId] =
		useState<Id<"characters">>()
	const editingCharacter = characters?.find(
		(it) => it._id === editingCharacterId,
	)

	if (characters === undefined) {
		return (
			<div className="flex flex-col items-center py-8">
				<LoadingIcon />
			</div>
		)
	}

	const filteredCharacters = matchSorter(characters, search, {
		keys: ["identity.name", "public.race"],
	}).sort((a, b) => Number(b.isPlayer) - Number(a.isPlayer))

	return (
		<>
			<SearchListLayout
				items={filteredCharacters}
				itemKey={(character) => character._id}
				renderItem={(character) => (
					<CharacterCard
						character={character}
						afterClone={(id) => {
							setEditingCharacterId(id)
							setEditorOpen(true)
						}}
					/>
				)}
				onSearch={setSearch}
				emptyStateIcon={<LucideUserX2 />}
				emptyStateText="No characters found"
				actions={
					room.isOwner && (
						<ToastActionForm
							action={async () => {
								const character = await createCharacter({
									roomId: room._id,
								})
								setEditingCharacterId(character)
								setEditorOpen(true)
							}}
						>
							<Button
								type="submit"
								appearance="clear"
								icon={<LucideUserRoundPlus />}
							>
								<span className="sr-only">Create Character</span>
							</Button>
						</ToastActionForm>
					)
				}
			/>
			{editingCharacter?.full && (
				<CharacterEditorDialog
					character={editingCharacter.full}
					open={editorOpen}
					setOpen={setEditorOpen}
				/>
			)}
		</>
	)
}
