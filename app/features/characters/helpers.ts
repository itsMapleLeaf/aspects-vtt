import { Iterator } from "iterator-helpers-polyfill"
import type { Id } from "../../../convex/_generated/dataModel"
import { getAspectSkill } from "../../../data/aspectSkills.ts"
import type { Attribute } from "../../../data/attributes.ts"
import { getRace } from "../../../data/races.ts"
import { statDiceKinds, statDiceKindsByName, type DiceKind } from "../dice/diceKinds.tsx"
import type { ApiCharacter } from "./types.ts"

export function getCharacterStressThresholds(character: ApiCharacter) {
	return {
		damage: character.strength + character.mobility + character.damageThresholdDelta,
		fatigue:
			character.sense + character.intellect + character.wit + character.fatigueThresholdDelta,
	}
}

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
	const race = character.race && getRace(character.race)
	return Object.entries(race?.abilities ?? {}).map(([name, description]) => ({
		name,
		description,
	}))
}

export function listCharacterAspectSkills(character: ApiCharacter) {
	return Iterator.from(character.learnedAspectSkills ?? [])
		?.flatMap((group) => group.aspectSkillIds)
		.map(getAspectSkill)
		.filter((skill) => skill != null)
}
