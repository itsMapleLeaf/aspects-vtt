export function startCase(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1)
}

export function* lines(text: string) {
	for (const [line] of text.matchAll(/[^\r\n]+/g)) {
		yield line
	}
}
