import { strict as assert } from "node:assert/strict"
import { describe, it } from "node:test"
import { sortBy } from "./iterable.ts"

describe("sortBy", () => {
	it("sorts the items in ascending order by numeric rank", () => {
		const items = ["Queen", "4", "3", "King", "Jack", "5", "Ace"]

		const ranks = new Map<string, number>()
			.set("Jack", 11)
			.set("Queen", 12)
			.set("King", 13)
			.set("Ace", 14)

		assert.deepStrictEqual(
			sortBy(items, (suit) => ranks.get(suit) ?? Number(suit)),
			["3", "4", "5", "Jack", "Queen", "King", "Ace"],
		)
	})

	it("sorts the items in ascending order alphabetically", () => {
		const items = ["Queen", "4", "3", "King", "Jack", "5", "Ace"]
		// sort by ending letters for fun
		assert.deepStrictEqual(
			sortBy(items, (suit) => [...suit].reverse().join("")),
			["3", "4", "5", "Ace", "King", "Jack", "Queen"],
		)
	})
})
