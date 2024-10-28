import { expect, test } from "vitest"
import { Vec } from "~/shared/vec.ts"
import { Rect } from "./rect.ts"

test("scaled with reference to origin", () => {
	expect(Rect.of(100, 100, 200, 200).scaledBy(0.5, Vec.zero)).toEqual(
		Rect.of(50, 50, 100, 100),
	)
})

test("scaled with reference to rect top left", () => {
	const rect = Rect.of(100, 100, 200, 200)
	expect(rect.scaledBy(0.5, rect.topLeft)).toEqual(Rect.of(100, 100, 100, 100))
})

test("scaled with reference to a point further right", () => {
	const referencePoint = Vec.of(300, 100)
	expect(Rect.of(100, 100, 200, 200).scaledBy(0.5, referencePoint)).toEqual(
		Rect.of(200, 100, 100, 100),
	)
})

test("scaled with reference to a point further down", () => {
	const referencePoint = Vec.of(100, 300)
	expect(Rect.bounds(100, 100, 300, 300).scaledBy(0.5, referencePoint)).toEqual(
		Rect.bounds(100, 200, 200, 300),
	)
})

test("moved to a new position", () => {
	const initialRect = Rect.of(100, 100, 200, 200)
	const newPosition = Vec.of(300, 300)
	expect(initialRect.movedTo(newPosition)).toEqual(Rect.of(300, 300, 200, 200))
})

test("moved by a vector", () => {
	const initialRect = Rect.of(100, 100, 200, 200)
	const moveVector = Vec.of(50, 50)
	expect(initialRect.movedBy(moveVector)).toEqual(Rect.of(150, 150, 200, 200))
})
