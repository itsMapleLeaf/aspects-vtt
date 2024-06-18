import assert from "node:assert/strict"
import { test } from "node:test"
import { Rect } from "./Rect.ts"
import { Vector } from "./Vector.ts"

test("Rect", () => {
	test("creates a rect from position and size", () => {
		const rect = Rect.from({ position: Vector.one, size: Vector.one })
		assert.deepStrictEqual(rect.start.xy, Vector.one.xy)
		assert.deepStrictEqual(rect.end.xy, Vector.one.times(2).xy)
	})
})
