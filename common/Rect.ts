import { Vector, type VectorInput, type VectorInputArgs } from "./Vector.ts"

export type RectInput =
	| { start: VectorInput; end: VectorInput }
	| { from: VectorInput; to: VectorInput }
	| { topLeft: VectorInput; bottomRight: VectorInput }
	| { x: number; y: number; width: number; height: number }
	| { left: number; top: number; width: number; height: number }
	| { left: number; top: number; right: number; bottom: number }
	| { position: VectorInput; size: VectorInput }
	| Rect

export class Rect {
	constructor(
		readonly start: Vector,
		readonly end: Vector,
	) {}

	static from(input: RectInput): Rect {
		if (input instanceof Rect) {
			return input
		}
		if ("start" in input) {
			return new Rect(Vector.from(input.start), Vector.from(input.end))
		}
		if ("from" in input) {
			return Rect.from({ start: input.from, end: input.to })
		}
		if ("topLeft" in input) {
			return Rect.from({ start: input.topLeft, end: input.bottomRight })
		}
		if ("x" in input) {
			const position = Vector.from(input.x, input.y)
			return new Rect(position, position.plus(input.width, input.height))
		}
		if ("left" in input && "right" in input) {
			return new Rect(
				Vector.from(input.left, input.top),
				Vector.from(input.right, input.bottom),
			)
		}
		if ("left" in input && "width" in input) {
			return Rect.from({
				position: Vector.from(input.left, input.top),
				size: Vector.fromSize(input),
			})
		}
		if ("position" in input) {
			const position = Vector.from(input.position)
			return new Rect(position, position.plus(input.size))
		}
		throw new Error(`Invalid rect input: ${JSON.stringify(input, null, 2)}`)
	}

	/** @deprecated Use {@link from} */
	static fromComponents(
		x: number,
		y: number,
		width: number,
		height: number,
	): Rect {
		return new Rect(Vector.from(x, y), Vector.from(width, height))
	}

	/** @deprecated Use {@link from} */
	static fromCorners(topLeft: Vector, bottomRight: Vector): Rect {
		return new Rect(topLeft, bottomRight)
	}

	get topLeft(): Vector {
		return Vector.topLeftMost(this.start, this.end)
	}

	get bottomRight(): Vector {
		return Vector.bottomRightMost(this.start, this.end)
	}

	get x(): number {
		return this.topLeft.x
	}

	get y(): number {
		return this.topLeft.y
	}

	get size(): Vector {
		return this.bottomRight.minus(this.topLeft)
	}

	get width(): number {
		return this.size.x
	}

	get height(): number {
		return this.size.y
	}

	get left(): number {
		return this.topLeft.x
	}

	get top(): number {
		return this.topLeft.y
	}

	get right(): number {
		return this.bottomRight.x
	}

	get bottom(): number {
		return this.bottomRight.y
	}

	get tuple(): readonly [
		left: number,
		top: number,
		width: number,
		height: number,
	] {
		const { left, top, width, height } = this
		return [left, top, width, height] as const
	}

	withStart(...input: VectorInputArgs) {
		return new Rect(Vector.from(...input), this.end)
	}

	withEnd(...input: VectorInputArgs) {
		return new Rect(this.start, Vector.from(...input))
	}

	withPosition(...position: VectorInputArgs): Rect {
		return Rect.from({ position: Vector.from(...position), size: this.size })
	}

	withSize(...size: VectorInputArgs): Rect {
		return Rect.from({ position: this.topLeft, size: Vector.from(...size) })
	}

	move(delta: VectorInput): Rect {
		return Rect.from({ position: this.topLeft.plus(delta), size: this.size })
	}

	scale(amount: VectorInput): Rect {
		return Rect.from({ position: this.topLeft, size: this.size.times(amount) })
	}

	withMinimumSize(...size: VectorInputArgs): Rect {
		const sizeVector = Vector.from(...size)
		return this.withSize(
			Vector.from(
				Math.max(sizeVector.x, this.size.x),
				Math.max(sizeVector.y, this.size.y),
			),
		)
	}

	overlaps(input: RectInput): boolean {
		const other = Rect.from(input)
		return (
			this.left < other.right &&
			this.right > other.left &&
			this.top < other.bottom &&
			this.bottom > other.top
		)
	}

	contains(...pointInput: VectorInputArgs) {
		const point = Vector.from(...pointInput)
		return (
			point.x > this.left &&
			point.x < this.right &&
			point.y > this.top &&
			point.y < this.bottom
		)
	}
}
