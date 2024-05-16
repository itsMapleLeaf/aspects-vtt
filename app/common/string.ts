export function startCase(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1)
}

export function* lines(text: string) {
	for (const [line] of text.matchAll(/[^\r\n]+/g)) {
		yield line
	}
}

/**
 * @example
 * splitByCase("PascalCasedString") // ["Pascal", "Cased", "String"]
 * splitByCase("snake_cased_string") // ["snake", "cased", "string"]
 * splitByCase("camelCasedString") // ["camel", "Cased", "String"]
 */
export function splitByCase(text: string): string[] {
	return [...(text.match(/[A-Z]?[a-z]+/g) ?? [])]
}

export function titleCase(text: string) {
	return splitByCase(text).map(startCase).join(" ")
}
