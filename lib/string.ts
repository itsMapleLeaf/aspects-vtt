import { startCase } from "lodash-es"

const ARTICLES = ["the", "a", "and", "or", "of"]

/**
 * Transforms a string into start-cased letters, accounting for capitalization
 * changes (like in camelCase) and lowercasing article words
 *
 * @example
 * 	formatTitle("embolden") // -> Embolden
 * 	formatTitle("dancingLights") // -> Dancing Lights
 * 	formatTitle("auraOfWeakness") // -> Aura of Weakness
 */
export function formatTitle(text: string) {
	const casedWords = text.matchAll(/\d+|[A-Z]{2,}|[A-Z]?[a-z]*/g)
	return [...casedWords]
		.filter(([word]) => word)
		.map(([word], index) =>
			ARTICLES.includes(word.toLowerCase()) && index > 0
				? word.toLowerCase()
				: startCase(word),
		)
		.join(" ")
}
