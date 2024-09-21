import { clamp } from "lodash-es"
import { Doc } from "~/convex/_generated/dataModel"
import { EntQueryCtx } from "~/convex/lib/ents.ts"
import { DEFAULT_WEALTH_TIER } from "~/features/characters/constants.ts"

export async function normalizeCharacter(
	ctx: EntQueryCtx,
	doc: Doc<"characters">,
) {
	const imageUrl = doc.imageId ? await ctx.storage.getUrl(doc.imageId) : null

	const attributes = normalizeCharacterAttributes(doc.attributes)

	const healthMax =
		getAttributeDie(attributes.strength) + getAttributeDie(attributes.mobility)
	const resolveMax = attributes.sense + attributes.intellect + attributes.wit

	const normalized = {
		...doc,

		attributes,

		imageUrl,

		health: doc.health ?? healthMax,
		healthMax,

		resolve: doc.resolve ?? resolveMax,
		resolveMax,

		wealth: doc.wealth ?? DEFAULT_WEALTH_TIER,

		battlemapPosition: doc.battlemapPosition ?? { x: 0, y: 0 },
	}
	return normalized satisfies Doc<"characters">
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

function normalizeAttribute(attribute: number | undefined): number {
	return clamp(attribute ?? 1, 1, 5)
}

export function getAttributeDie(attribute: number) {
	return [4, 6, 8, 10, 12][normalizeAttribute(attribute) - 1] as number
}
