import { clamp } from "~/helpers/math.ts"
import { randomInt } from "~/helpers/random.ts"
import type { Nullish } from "~/helpers/types.ts"
import { statDiceKinds, statDiceKindsByName } from "../dice/data.tsx"
import { AttributeMax, AttributeMin } from "./constants.ts"

function getAttributeDie(value: number) {
	return statDiceKinds[value - 1] ?? statDiceKindsByName.d4
}

export function getAttributePower(value: number) {
	return getAttributeDie(value).faces.length
}

export function normalizeAttributeValue(value: Nullish<number>) {
	return clamp(value ?? 1, AttributeMin, AttributeMax)
}

export function getRandomAttributeValue() {
	return randomInt(AttributeMin, AttributeMax)
}
