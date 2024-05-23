import { DefinitionList } from "../../ui/DefinitionList.tsx"
import type { ApiCharacter } from "./types.ts"
import { useCharacterRaceAbilities } from "./useCharacterRaceAbilities.ts"

export function CharacterRaceAbilityList({ character }: { character: ApiCharacter }) {
	const abilities = useCharacterRaceAbilities(character)
	return <DefinitionList items={abilities} />
}
