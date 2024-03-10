import type { Doc } from "convex-backend/_generated/dataModel.js"
import { useCurrentCharacterId } from "~/features/characters/useCurrentCharacterId"
import { Select } from "~/ui/Select"

export function CharacterSelect({ characters }: { characters: Doc<"characters">[] }) {
	const [currentCharacterId, setCurrentCharacterId] = useCurrentCharacterId()
	return characters.length === 0 ?
			<p className="flex h-10 flex-row items-center px-2 opacity-60">No characters found.</p>
		:	<Select
				options={characters.map((character) => ({ value: character._id, label: character.name }))}
				value={currentCharacterId}
				onChange={setCurrentCharacterId}
			/>
}
