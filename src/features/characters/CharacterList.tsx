import { useQuery } from "convex/react"
import { LucideUserX2 } from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { api } from "~/convex/_generated/api.js"
import { SearchListLayout } from "../inventory/SearchListLayout.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { CharacterCard } from "./CharacterCard.tsx"

export function CharacterList() {
	const room = useRoomContext()
	const characters = useQuery(api.characters.list, {
		roomId: room._id,
	})
	const [search, setSearch] = useState("")

	if (characters === undefined) {
		return (
			<div className="flex flex-col items-center py-8">
				<LoadingIcon />
			</div>
		)
	}

	const filteredCharacters = matchSorter(characters, search, {
		keys: ["identity.name", "public.race"],
	})

	return (
		<SearchListLayout
			items={filteredCharacters}
			itemKey={(character) => character.public._id}
			renderItem={(character) => <CharacterCard character={character} />}
			onSearch={setSearch}
			emptyStateIcon={<LucideUserX2 />}
			emptyStateText="No characters found"
			className="h-full border-t border-primary-700"
		/>
	)
}
