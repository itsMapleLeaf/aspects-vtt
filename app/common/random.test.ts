import { describe, expect, it } from "bun:test"
import { randomItem } from "./random.ts"

describe("randomItem", () => {
	it("should return every item at least once when run multiple times", () => {
		const items = ["a", "b", "c"]
		const randomItems = new Set([...Array(1000)].map(() => randomItem(items)))
		expect(randomItems.size).toBe(items.length)
	})
})
