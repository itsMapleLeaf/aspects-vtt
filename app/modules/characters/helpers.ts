import { Iterator } from "iterator-helpers-polyfill"
import { $path } from "remix-routes"
import { entries } from "~/helpers/object.ts"
import type { Id } from "../../../convex/_generated/dataModel"
import { getAspectSkill } from "../aspect-skills/data.ts"
import type { Attribute } from "../attributes/data.ts"
import { statDiceKinds, statDiceKindsByName, type DiceKind } from "../dice/data.tsx"
import { getRace } from "../races/data.ts"
import type { ApiCharacter } from "./types.ts"

export function formatCharacterMention(character: { _id: Id<"characters"> }) {
	return `<@${character._id}>`
}

export function getCharacterAttributeDiceKind(
	character: ApiCharacter,
	attribute: Attribute,
): DiceKind {
	const kind = statDiceKinds.find((kind) => kind.faces.length === character[attribute.id])
	return kind ?? statDiceKindsByName.d4
}

export function listCharacterRaceAbilities(character: ApiCharacter) {
	if (!character.race) return Iterator.from([])
	const race = getRace(character.race)
	return Iterator.from(entries(race.abilities))
		.map(([name, description]) => ({
			name,
			description,
		}))
		.toArray()
}

export function listCharacterAspectSkills(character: ApiCharacter) {
	return Iterator.from(character.learnedAspectSkills ?? [])
		?.flatMap((group) => group.aspectSkillIds)
		.map(getAspectSkill)
		.filter((skill) => skill != null)
}

export function getCharacterFallbackImageUrl(character: ApiCharacter) {
	return character.race ?
			$path(
				"/characters/fallback/:race",
				{ race: character.race.toLowerCase() },
				{
					seed: String(
						Iterator.from(character._id).reduce((total, char) => total + char.charCodeAt(0), 0),
					),
				},
			)
		:	undefined
}
