import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { withMovedItem } from "./array.ts"

describe("withMovedItem", () => {
	it("should move an item from one index to another", () => {
		assert.deepStrictEqual(withMovedItem([1, 2, 3], 0, 1), [2, 1, 3])
		assert.deepStrictEqual(withMovedItem([1, 2, 3], 0, 2), [2, 3, 1])
		assert.deepStrictEqual(withMovedItem([1, 2, 3], 1, 0), [2, 1, 3])
		assert.deepStrictEqual(withMovedItem([1, 2, 3], 1, 2), [1, 3, 2])
		assert.deepStrictEqual(withMovedItem([1, 2, 3], 2, 0), [3, 1, 2])
		assert.deepStrictEqual(withMovedItem([1, 2, 3], 2, 1), [1, 3, 2])
	})

	it("should throw if fromIndex or toIndex is out of range", () => {
		assert.throws(() => withMovedItem([1, 2, 3], -1, 0), /out of range/)
		assert.throws(() => withMovedItem([1, 2, 3], -2, 0), /out of range/)
		assert.throws(() => withMovedItem([1, 2, 3], 3, 0), /out of range/)
		assert.throws(() => withMovedItem([1, 2, 3], 4, 0), /out of range/)

		assert.throws(() => withMovedItem([1, 2, 3], 0, -1), /out of range/)
		assert.throws(() => withMovedItem([1, 2, 3], 0, -2), /out of range/)
		assert.throws(() => withMovedItem([1, 2, 3], 0, 3), /out of range/)
		assert.throws(() => withMovedItem([1, 2, 3], 0, 4), /out of range/)
	})

	it("should throw if fromIndex or toIndex is not an integer", () => {
		assert.throws(
			() => withMovedItem([1, 2, 3], Number.POSITIVE_INFINITY, 0),
			/fromIndex must be an integer/,
		)
		assert.throws(() => withMovedItem([1, 2, 3], Number.NaN, 0), /fromIndex must be an integer/)
		assert.throws(() => withMovedItem([1, 2, 3], 69 / 420, 0), /fromIndex must be an integer/)

		assert.throws(
			() => withMovedItem([1, 2, 3], 0, Number.POSITIVE_INFINITY),
			/toIndex must be an integer/,
		)
		assert.throws(() => withMovedItem([1, 2, 3], 0, Number.NaN), /toIndex must be an integer/)
		assert.throws(() => withMovedItem([1, 2, 3], 0, 69 / 420), /toIndex must be an integer/)
	})

	it("should return the input if fromIndex is the same as toIndex", () => {
		const input = [1, 2, 3]
		assert.strictEqual(withMovedItem(input, 0, 0), input)
		assert.strictEqual(withMovedItem(input, 1, 1), input)
		assert.strictEqual(withMovedItem(input, 2, 2), input)
	})

	it("should return the input if the array is empty", () => {
		const input: [] = []
		assert.strictEqual(withMovedItem(input, 0, 0), input)
	})
})
