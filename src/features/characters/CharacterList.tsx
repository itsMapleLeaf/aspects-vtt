import { useMutation, useQuery } from "convex/react"
import { LucideUserRoundPlus, LucideUserX2 } from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import { Button } from "~/components/Button.tsx"
import { EmptyState } from "~/components/EmptyState.tsx"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { textInput } from "~/styles/input.ts"
import { ScrollArea } from "../../components/ScrollArea.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { CharacterCard } from "./CharacterCard.tsx"
import { ApiCharacter } from "./types.ts"

export function CharacterList() {
	const room = useRoomContext()
	const characters = useQuery(api.characters.list, { roomId: room._id })
	const createCharacter = useMutation(api.characters.create)
	const [search, setSearch] = useState("")
	const [editingId, setEditingId] = useState<Id<"characters">>()

	if (characters === undefined) {
		return (
			<div className="flex flex-col items-center py-8">
				<LoadingIcon />
			</div>
		)
	}

	// prettier-ignore
	const getRank = (character: ApiCharacter) =>
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
		createCharacter({ roomId: room._id }).then(setEditingId)
	}

	return (
		<div className="flex h-full min-h-0 flex-col gap-2">
			<div className="flex gap">
				<input
					className={textInput("flex-1")}
					placeholder="Search..."
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>
				{room.isOwner && (
					<form action={handleCreate} className="contents">
						<Button
							type="submit"
							appearance="clear"
							icon={<LucideUserRoundPlus />}
						>
							<span className="sr-only">Create Character</span>
						</Button>
					</form>
				)}
			</div>
			{filteredCharacters.length > 0 ? (
				<ScrollArea>
					<ul className="flex w-full min-w-0 flex-col gap-2">
						{filteredCharacters.map((character) => (
							<li key={character._id} className="contents">
								<CharacterCard
									character={character}
									open={editingId === character._id}
									setOpen={(newOpen) => {
										setEditingId(newOpen ? character._id : undefined)
									}}
									afterClone={setEditingId}
								/>
							</li>
						))}
					</ul>
				</ScrollArea>
			) : (
				<EmptyState text="No characters found" icon={<LucideUserX2 />} />
			)}
		</div>
	)
}
