import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api.js"
import type { ApiCharacter } from "./types.ts"

export function useCharacterRaceAbilities(character: ApiCharacter) {
	const notionData = useQuery(api.notionImports.functions.get, {})
	const race = notionData?.races.find((r) => r.name === character.race)
	return race?.abilities ?? []
}
