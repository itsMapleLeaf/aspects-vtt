import { Iterator } from "iterator-helpers-polyfill"
import type { Id } from "../../../convex/_generated/dataModel"
import { getAspectSkill } from "../aspect-skills/data.ts"
import type { Attribute } from "../attributes/data.ts"
import { useUser } from "../auth/UserContext.tsx"
import { statDiceKinds, statDiceKindsByName, type DiceKind } from "../dice/data.tsx"
import { getRace } from "../races/data.ts"
import { useCharacters } from "../rooms/roomContext.tsx"
import { OwnedCharacter, type ApiCharacter } from "./types.ts"

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

export function useOwnedCharacter() {
	const user = useUser()
	const ownedCharacter = useCharacters()
		.filter((character) => character.playerId === user?.clerkId)
		.find(OwnedCharacter.is)
	return ownedCharacter
}
