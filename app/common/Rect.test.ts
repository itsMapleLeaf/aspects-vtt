import { describe, expect, it } from "bun:test"
import { Rect } from "./Rect.ts"
import { Vector } from "./vector.ts"

describe("Rect", () => {
	it("creates a rect from position and size", () => {
		const rect = Rect.from({ position: Vector.one, size: Vector.one })
		expect(rect.start.xy).toEqual(Vector.one.xy)
		expect(rect.end.xy).toEqual(Vector.one.times(2).xy)
	})
})
