import { Iterator } from "iterator-helpers-polyfill"
import { $path } from "remix-routes"
import type { Nullish } from "~/helpers/types.ts"
import type { Id } from "../../../convex/_generated/dataModel"
import { SkillId, getAspectSkill, type Skill } from "../aspect-skills/data.ts"
import type { Attribute } from "../attributes/data.ts"
import { normalizeAttributeValue } from "../attributes/helpers.ts"
import { statDiceKinds, statDiceKindsByName, type DiceKind } from "../dice/data.tsx"
import { getRace } from "../races/data.ts"
import type { ApiCharacter, CharacterAttributeValues } from "./types.ts"

export function formatCharacterMention(character: { _id: Id<"characters"> }) {
	return `<@${character._id}>`
}

export function getCharacterAttributeDiceKind(
	character: CharacterAttributeValues,
	attributeId: Attribute["id"],
): DiceKind {
	const value = normalizeAttributeValue(character[attributeId])
	return statDiceKinds[value - 1] ?? statDiceKindsByName.d4
}

export function listCharacterRaceAbilities(character: ApiCharacter) {
	const race = character.race && getRace(character.race)
	return Object.values(race?.abilities ?? {})
}

export function listCharacterAspectSkills(character: ApiCharacter) {
	return Iterator.from(character.learnedAspectSkills ?? [])
		?.flatMap((group) => group.aspectSkillIds)
		.map((id) => getAspectSkill(SkillId(id)))
		.filter((skill): skill is Skill => skill != null)
}

export function getCharacterFallbackImageUrl(character: {
	_id: Id<"characters">
	race?: Nullish<string>
}) {
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
