import { twMerge } from "tailwind-merge"
import { ensureSomething } from "~/shared/errors.ts"
import { List } from "~/shared/list.ts"
import { mod } from "../../common/math.ts"

const conditionColors = [
	twMerge(
		"border-pink-700 bg-pink-700/75 hover:border-pink-800 hover:bg-pink-800/75",
	),
	twMerge(
		"border-red-700 bg-red-700/75 hover:border-red-800 hover:bg-red-800/75",
	),
	twMerge(
		"border-orange-700 bg-orange-700/75 hover:border-orange-800 hover:bg-orange-800/75",
	),
	twMerge(
		"border-yellow-700 bg-yellow-700/75 hover:border-yellow-800 hover:bg-yellow-800/75",
	),
	twMerge(
		"border-lime-700 bg-lime-700/75 hover:border-lime-800 hover:bg-lime-800/75",
	),
	twMerge(
		"border-green-700 bg-green-700/75 hover:border-green-800 hover:bg-green-800/75",
	),
	twMerge(
		"border-teal-700 bg-teal-700/75 hover:border-teal-800 hover:bg-teal-800/75",
	),
	twMerge(
		"border-blue-700 bg-blue-700/75 hover:border-blue-800 hover:bg-blue-800/75",
	),
	twMerge(
		"border-violet-700 bg-violet-700/75 hover:border-violet-800 hover:bg-violet-800/75",
	),
]

// we'll cache this since the calculation is nontrivial
const cache = new Map<string, string>()

export function getConditionColorClasses(condition: string): string {
	let result = cache.get(condition)
	if (result) {
		return result
	}

	const hash = List.from(condition)
		.map((c) => c.codePointAt(0))
		.sum()
	result = ensureSomething(conditionColors[mod(hash, conditionColors.length)])
	cache.set(condition, result)
	return result
}
