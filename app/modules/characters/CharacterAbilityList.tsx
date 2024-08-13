import { DefinitionList } from "~/ui/DefinitionList.tsx"
import {
	listCharacterAspectSkills,
	listCharacterRaceAbilities,
} from "./helpers.ts"
import { useCharacterUpdatePermission } from "./hooks.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterAbilityList({
	character,
}: {
	character: ApiCharacter
}) {
	const raceAbilities = listCharacterRaceAbilities(character)
	const hasPermission = useCharacterUpdatePermission(character)
	const aspectSkills = hasPermission ? listCharacterAspectSkills(character) : []
	return (
		<>
			<DefinitionList items={[...raceAbilities, ...aspectSkills]} />
			{hasPermission ? null : (
				<p className="mt-1.5 opacity-75">Aspect skills are hidden.</p>
			)}
		</>
	)
}
