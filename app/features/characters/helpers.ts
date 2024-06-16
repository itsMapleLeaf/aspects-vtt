import type { Id } from "../../../convex/_generated/dataModel"
import type { Attribute } from "../../../data/attributes.ts"
import { statDiceKinds, statDiceKindsByName, type DiceKind } from "../dice/diceKinds.tsx"
import type { ApiCharacter } from "./types.ts"

export function getThresholds(character: ApiCharacter) {
	return {
		damage: character.strength + character.mobility + character.damageThresholdDelta,
		fatigue:
			character.sense + character.intellect + character.wit + character.fatigueThresholdDelta,
	}
}

export function formatMention(character: { _id: Id<"characters"> }) {
	return `<@${character._id}>`
}

export function getAttributeDiceKind(character: ApiCharacter, attribute: Attribute): DiceKind {
	const kind = statDiceKinds.find((kind) => kind.faces.length === character[attribute.id])
	return kind ?? statDiceKindsByName.d4
}
