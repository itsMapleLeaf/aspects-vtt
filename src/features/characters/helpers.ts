import { clamp } from "lodash-es"
import { Doc } from "~/convex/_generated/dataModel"
export function getAttributeDie(attribute: number) {
	return [4, 6, 8, 10, 12][normalizeAttribute(attribute) - 1] as number
}

export function normalizeCharacterAttributes(
	attributes: Doc<"characters">["attributes"],
) {
	return {
		strength: normalizeAttribute(attributes?.strength),
		sense: normalizeAttribute(attributes?.sense),
		mobility: normalizeAttribute(attributes?.mobility),
		intellect: normalizeAttribute(attributes?.intellect),
		wit: normalizeAttribute(attributes?.wit),
	}
}

export function normalizeAttribute(attribute: number | undefined): number {
	return clamp(attribute ?? 1, 1, 5)
}
