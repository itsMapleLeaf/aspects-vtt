import type { ApiCharacter } from "./types.ts"

export function getThresholds(character: ApiCharacter) {
	return {
		damage:
			character.strength + character.mobility + character.damageThresholdDelta,
		fatigue:
			character.sense +
			character.intellect +
			character.wit +
			character.fatigueThresholdDelta,
	}
}
