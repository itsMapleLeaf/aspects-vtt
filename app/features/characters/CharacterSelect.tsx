import { useCurrentCharacterId } from "#app/features/characters/useCurrentCharacterId.ts"
import { Select } from "#app/ui/Select.tsx"
import type { Doc } from "#convex/_generated/dataModel.js"
import { getCharacterIdentifier } from "./characterFields.tsx"

export function CharacterSelect({
	characters,
}: {
	characters: Doc<"characters">[]
}) {
	const [currentCharacterId, setCurrentCharacterId] = useCurrentCharacterId()
	return characters.length === 0 ? (
		<p className="flex h-10 flex-row items-center px-2 opacity-60">No characters found.</p>
	) : (
		<Select
			options={characters.map((character) => ({
				value: character._id,
				label: getCharacterIdentifier(character),
			}))}
			value={currentCharacterId}
			onChange={setCurrentCharacterId}
		/>
	)
}
