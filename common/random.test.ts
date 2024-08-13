import { describe, it } from "bun:test"
import assert from "node:assert/strict"
import { Iterator } from "iterator-helpers-polyfill"
import { randomItem } from "./random.ts"

describe("randomItem", () => {
	it("should return every item at least once when run multiple times", () => {
		const items = ["a", "b", "c"]
		const randomItems = new Set(
			Iterator.range(1000).map(() => randomItem(items)),
		)
		assert.strictEqual(randomItems.size, items.length)
	})
})
