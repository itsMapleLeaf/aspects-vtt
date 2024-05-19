import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api.js"
import type { ApiCharacter } from "./types.ts"

export function useCharacterAbilities(character: ApiCharacter) {
	const notionData = useQuery(api.notionImports.functions.get, {})
	const race = notionData?.races.find((r) => r.name === character.race)

	const aspectSkillsByName = new Map(
		notionData?.aspectSkills.map((skill) => [skill.name, skill]),
	)
	const aspectSkills = character.aspectSkills
		.map((name) => aspectSkillsByName.get(name))
		.filter(Boolean)

	return [...(race?.abilities ?? []), ...aspectSkills]
}
