import { Iterator } from "iterator-helpers-polyfill"
import assert from "node:assert/strict"
import { describe, it } from "node:test"
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
