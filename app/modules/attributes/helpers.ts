import { Brand } from "effect"
import { clamp } from "../../../common/math.ts"
import { randomInt } from "../../../common/random.ts"
import type { Nullish } from "../../../common/types.ts"
import { statDiceKinds, statDiceKindsByName } from "../dice/data.tsx"
import { AttributeMax, AttributeMin } from "./constants.ts"

function getAttributeDie(value: number) {
	return statDiceKinds[value - 1] ?? statDiceKindsByName.d4
}

export function getAttributePower(value: number) {
	return getAttributeDie(value).faces.length
}

export type NormalizedAttributeValue = Brand.Branded<
	number,
	"NormalizedAttributeValue"
>
const NormalizedAttributeValue = Brand.nominal<NormalizedAttributeValue>()

export function normalizeAttributeValue(value: Nullish<number>) {
	return NormalizedAttributeValue(clamp(value ?? 1, AttributeMin, AttributeMax))
}

export function getRandomAttributeValue() {
	return randomInt(AttributeMin, AttributeMax)
}
