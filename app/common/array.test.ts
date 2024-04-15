import { describe, expect, it } from "bun:test"
import { withMovedItem } from "./array.ts"

describe("withMovedItem", () => {
	it("should move an item from one index to another", () => {
		expect(withMovedItem([1, 2, 3], 0, 1)).toEqual([2, 1, 3])
		expect(withMovedItem([1, 2, 3], 0, 2)).toEqual([2, 3, 1])
		expect(withMovedItem([1, 2, 3], 1, 0)).toEqual([2, 1, 3])
		expect(withMovedItem([1, 2, 3], 1, 2)).toEqual([1, 3, 2])
		expect(withMovedItem([1, 2, 3], 2, 0)).toEqual([3, 1, 2])
		expect(withMovedItem([1, 2, 3], 2, 1)).toEqual([1, 3, 2])
	})

	it("should throw if fromIndex or toIndex is out of range", () => {
		expect(() => withMovedItem([1, 2, 3], -1, 0)).toThrow(/out of range/)
		expect(() => withMovedItem([1, 2, 3], -2, 0)).toThrow(/out of range/)
		expect(() => withMovedItem([1, 2, 3], 3, 0)).toThrow(/out of range/)
		expect(() => withMovedItem([1, 2, 3], 4, 0)).toThrow(/out of range/)

		expect(() => withMovedItem([1, 2, 3], 0, -1)).toThrow(/out of range/)
		expect(() => withMovedItem([1, 2, 3], 0, -2)).toThrow(/out of range/)
		expect(() => withMovedItem([1, 2, 3], 0, 3)).toThrow(/out of range/)
		expect(() => withMovedItem([1, 2, 3], 0, 4)).toThrow(/out of range/)
	})

	it("should throw if fromIndex or toIndex is not an integer", () => {
		expect(() => withMovedItem([1, 2, 3], Number.POSITIVE_INFINITY, 0)).toThrow(
			/fromIndex must be an integer/,
		)
		expect(() => withMovedItem([1, 2, 3], Number.NaN, 0)).toThrow(/fromIndex must be an integer/)
		expect(() => withMovedItem([1, 2, 3], 69 / 420, 0)).toThrow(/fromIndex must be an integer/)

		expect(() => withMovedItem([1, 2, 3], 0, Number.POSITIVE_INFINITY)).toThrow(
			/toIndex must be an integer/,
		)
		expect(() => withMovedItem([1, 2, 3], 0, Number.NaN)).toThrow(/toIndex must be an integer/)
		expect(() => withMovedItem([1, 2, 3], 0, 69 / 420)).toThrow(/toIndex must be an integer/)
	})

	it("should return the input if fromIndex is the same as toIndex", () => {
		const input = [1, 2, 3]
		expect(withMovedItem(input, 0, 0)).toBe(input)
		expect(withMovedItem(input, 1, 1)).toBe(input)
		expect(withMovedItem(input, 2, 2)).toBe(input)
	})

	it("should return the input if the array is empty", () => {
		const input: [] = []
		expect(withMovedItem(input, 0, 0)).toBe(input)
	})
})
