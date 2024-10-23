import { useMutation, useQuery } from "convex/react"
import { LucideUserRoundPlus, LucideUserX2 } from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import { Button } from "~/components/Button.tsx"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { useCharacterEditorDialog } from "~/features/characters/CharacterEditorDialog"
import { SearchListLayout } from "../inventory/SearchListLayout.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { CharacterCard } from "./CharacterCard.tsx"
import { ApiCharacter } from "./types.ts"

export function CharacterList() {
	const room = useRoomContext()
	const characters = useQuery(api.characters.list, { roomId: room._id })
	const createCharacter = useMutation(api.characters.create)
	const [search, setSearch] = useState("")
	const [openCharacterId, setOpenCharacterId] = useState<Id<"characters">>()
	const editor = useCharacterEditorDialog()

	if (characters === undefined) {
		return (
			<div className="flex flex-col items-center py-8">
				<LoadingIcon />
			</div>
		)
	}

	// prettier-ignore
	const getRank = (character:ApiCharacter) =>
		character.isPlayer ? 0 :
		character.type === 'player' ? 1 :
		character.type === 'npc' ? 2 :
		99999

	const filteredCharacters = matchSorter(characters, search, {
		keys: ["identity.name", "public.race"],
		sorter: (items) => {
			return items
				.sort((a, b) => b.rank - a.rank)
				.sort((a, b) =>
					(a.item.identity?.name ?? "")
						.toLowerCase()
						.localeCompare((b.item.identity?.name ?? "").toLowerCase()),
				)
				.sort((a, b) => getRank(a.item) - getRank(b.item))
		},
	})

	const handleCreate = () => {
		createCharacter({ roomId: room._id }).then(editor.show)
	}

	return (
		<>
			{editor.element}
			<SearchListLayout
				items={filteredCharacters}
				itemKey={(character) => character._id}
				renderItem={(character) => (
					<CharacterCard
						character={character}
						open={openCharacterId === character._id}
						onOpen={() => {
							setOpenCharacterId((id) =>
								id === character._id ? undefined : character._id,
							)
						}}
						onClose={() => setOpenCharacterId(undefined)}
						afterClone={editor.show}
					/>
				)}
				onSearch={setSearch}
				emptyStateIcon={<LucideUserX2 />}
				emptyStateText="No characters found"
				actions={
					room.isOwner && (
						<form action={handleCreate} className="contents">
							<Button
								type="submit"
								appearance="clear"
								icon={<LucideUserRoundPlus />}
							>
								<span className="sr-only">Create Character</span>
							</Button>
						</form>
					)
				}
			/>
		</>
	)
}
