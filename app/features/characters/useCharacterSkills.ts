import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api.js"
import type { ApiCharacter } from "./types.ts"

export function useCharacterSkills(character: ApiCharacter) {
	const notionData = useQuery(api.notionImports.get)
	const race = notionData?.races.find((r) => r.name === character.race)
	const coreAspect = notionData?.aspects.find((it) => it.name === character.coreAspect)

	const aspectSkillsByName = new Map(notionData?.aspectSkills.map((skill) => [skill.name, skill]))
	const aspectSkills = character.aspectSkills
		.map((name) => aspectSkillsByName.get(name))
		.filter(Boolean)

	return [coreAspect?.ability].concat(race?.abilities, aspectSkills).filter(Boolean)
}
