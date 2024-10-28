import { match, P } from "ts-pattern"
import { Vec, VecInput } from "~/shared/vec.ts"

export type RectInput =
	| { x: number; y: number; width: number; height: number }
	| { left: number; top: number; width: number; height: number }
	| [x: number, y: number, width: number, height: number]
	| [topLeft: VecInput, size: VecInput]

export class Rect {
	static of(
		...args:
			| [left: number, top: number, width: number, height: number]
			| [topLeft: VecInput, size: VecInput]
	) {
		return match(args)
			.with(
				[P.number, P.number, P.number, P.number],
				([left, top, width, height]) => new Rect(left, top, width, height),
			)
			.with([P._, P._], (args) => {
				const topLeft = Vec.from(args[0])
				const size = Vec.from(args[1])
				return new Rect(topLeft.x, topLeft.y, size.x, size.y)
			})
			.exhaustive()
	}

	static from(input: RectInput) {
		if (input instanceof Rect) {
			return input
		}
		return match(input)
			.with(
				{ left: P.number, top: P.number, width: P.number, height: P.number },
				({ left, top, width, height }) => Rect.of(left, top, width, height),
			)
			.with(
				{ x: P.number, y: P.number, width: P.number, height: P.number },
				({ x, y, width, height }) => Rect.of(x, y, width, height),
			)
			.with([P._, P._], ([topLeft, size]) => Rect.of(topLeft, size))
			.with(
				[P.number, P.number, P.number, P.number],
				([left, top, width, height]) => Rect.of(left, top, width, height),
			)
			.exhaustive()
	}

	static bounds(
		...args:
			| [left: number, top: number, right: number, bottom: number]
			| [start: VecInput, end: VecInput]
	) {
		const [start, end] = match(args)
			.returnType<readonly [Vec, Vec]>()
			.with(
				[P.number, P.number, P.number, P.number],
				([startX, startY, endX, endY]) => [
					Vec.of(startX, startY),
					Vec.of(endX, endY),
				],
			)
			.with([P._, P._], ([start, end]) => [Vec.from(start), Vec.from(end)])
			.exhaustive()

		const topLeft = Vec.of(Math.min(start.x, end.x), Math.min(start.y, end.y))
		const bottomRight = Vec.of(
			Math.max(start.x, end.x),
			Math.max(start.y, end.y),
		)
		const size = bottomRight.minus(topLeft)

		return Rect.of(topLeft, size)
	}

	private constructor(
		readonly left: number,
		readonly top: number,
		readonly width: number,
		readonly height: number,
	) {}

	get right() {
		return this.left + this.width
	}

	get bottom() {
		return this.top + this.height
	}

	get topLeft() {
		return Vec.of(this.left, this.top)
	}

	get topRight() {
		return Vec.of(this.right, this.top)
	}

	get bottomLeft() {
		return Vec.of(this.left, this.bottom)
	}

	get bottomRight() {
		return Vec.of(this.right, this.bottom)
	}

	get size() {
		return Vec.of(this.width, this.height)
	}

	get center() {
		return this.topLeft.plus(this.size.dividedBy(2))
	}

	intersects(input: RectInput) {
		const other = Rect.from(input)
		return (
			this.left < other.right &&
			this.right > other.left &&
			this.top < other.bottom &&
			this.bottom > other.top
		)
	}

	movedTo(input: VecInput) {
		return Rect.of(input, this.size)
	}

	movedBy(input: VecInput) {
		return Rect.of(this.topLeft.plus(input), this.size)
	}

	sizedTo(size: VecInput) {
		return Rect.of(this.topLeft, size)
	}

	scaledBy(input: VecInput, referenceInput: VecInput = Vec.zero) {
		const factor = Vec.from(input)
		const reference = Vec.from(referenceInput)

		const newTopLeft = this.topLeft.plus(
			reference.minus(this.topLeft).times(factor),
		)

		const newBottomRight = this.bottomRight.plus(
			reference.minus(this.bottomRight).times(factor),
		)

		return Rect.bounds(newTopLeft, newBottomRight)
	}
}
