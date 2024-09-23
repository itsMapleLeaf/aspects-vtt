import { List } from "~/shared/list.ts"

export type RaceName = (typeof RACE_NAMES)[number]
export const RACE_NAMES = List.of(
	...([
		"Aquilian",
		"Arctana",
		"Cetacian",
		"Felirian",
		"Lagorei",
		"Macridian",
		"Marenti",
		"Myrmadon",
		"Pyra",
		"Renari",
		"Sylvanix",
		"Umbraleth",
	] as const),
)
