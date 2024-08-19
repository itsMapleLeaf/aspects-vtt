/**
 * Inverts the colors in the Tailwind CSS theme, so that the darkest colors are
 * lightest, and the lightest colors are darkest.
 */
import { readFile, writeFile } from "node:fs/promises"
import { globStream } from "fast-glob"

for await (const file of globStream("app/**/*.{ts,tsx}", { absolute: true })) {
	const content = await readFile(file, "utf8")
	const replacements: [string, string][] = []

	// -primary-100 -> -primary-900
	// -primary-200 -> -primary-800
	// -primary-300 -> -primary-700
	// ...
	const fixed = content.replaceAll(
		/-primary-([1-9])00/g,
		(match, num: string) => {
			replacements.push([match, `-primary-${(Number(num) - 10) * -1}00`])
			return `-primary-${(Number(num) - 10) * -1}00`
		},
	)

	if (replacements.length > 0) {
		console.info(`${file}:`)
		for (const [from, to] of replacements) {
			console.info(`  ${from} -> ${to}`)
		}
	}

	if (content !== fixed) {
		await writeFile(file, fixed, "utf8")
	}
}
