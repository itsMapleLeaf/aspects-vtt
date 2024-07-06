import { Iterator } from "iterator-helpers-polyfill"
import { unwrap } from "../../app/helpers/errors.ts"
import type { DiceInput } from "../messages/types.ts"

export function* createDiceRolls(inputs: Iterable<DiceInput>) {
	for (const { name, sides, count, explodes } of inputs) {
		for (const _ of Iterator.range(count)) {
			let result
			do {
				result = getRandomNumber(sides)
				yield { key: crypto.randomUUID(), name, result }
			} while (explodes && result === sides)
		}
	}
}

const getRandomNumber = (() => {
	const output = new Uint32Array(1)
	/** Returns a random number between 1 and `max` (inclusive). */
	return function getRandomNumber(max: number) {
		crypto.getRandomValues(output)
		return (unwrap(output[0], "what") % max) + 1
	}
})()
