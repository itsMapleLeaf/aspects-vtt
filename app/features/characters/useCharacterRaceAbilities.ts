import { useNotionData } from "../game/NotionDataContext.tsx"
import type { ApiCharacter } from "./types.ts"

export function useCharacterRaceAbilities(character: ApiCharacter) {
	const notionData = useNotionData()
	const race = notionData?.races.find((r) => r.name === character.race)
	return race?.abilities ?? []
}
