import { describe, expect, it } from "bun:test"
import { sortBy } from "./collection.ts"

describe("sortBy", () => {
	it("sorts the items in ascending order by numeric rank", () => {
		const items = ["Queen", "4", "3", "King", "Jack", "5", "Ace"]

		const ranks = new Map<string, number>()
			.set("Jack", 11)
			.set("Queen", 12)
			.set("King", 13)
			.set("Ace", 14)

		expect(sortBy(items, (suit) => ranks.get(suit) ?? Number(suit))).toEqual([
			"3",
			"4",
			"5",
			"Jack",
			"Queen",
			"King",
			"Ace",
		])
	})
	it("sorts the items in ascending order alphabetically", () => {
		const items = ["Queen", "4", "3", "King", "Jack", "5", "Ace"]
		// sort by ending letters for fun
		expect(sortBy(items, (suit) => [...suit].reverse().join(""))).toEqual([
			"3",
			"4",
			"5",
			"Ace",
			"King",
			"Jack",
			"Queen",
		])
	})
})
