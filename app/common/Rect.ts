import { Vector, type VectorInput } from "./vector.ts"

export class Rect {
	readonly position: Vector
	readonly size: Vector

	constructor(position: Vector, size: Vector) {
		this.position = position
		this.size = size
	}

	static fromComponents(x: number, y: number, width: number, height: number) {
		return new Rect(Vector.from(x, y), Vector.from(width, height))
	}

	static fromCorners(topLeft: Vector, bottomRight: Vector) {
		return new Rect(Vector.topLeftMost(topLeft, bottomRight), topLeft.minus(bottomRight).abs)
	}

	get x() {
		return this.position.x
	}

	get y() {
		return this.position.y
	}

	get width() {
		return this.size.x
	}

	get height() {
		return this.size.y
	}

	get left() {
		return this.position.x
	}

	get right() {
		return this.position.x + this.width
	}

	get top() {
		return this.position.y
	}

	get bottom() {
		return this.position.y + this.height
	}

	get topLeft() {
		return this.position
	}

	get bottomRight() {
		return this.position.plus(this.size)
	}

	get tuple() {
		const { x, y, width, height } = this
		return [x, y, width, height] as const
	}

	withPosition(...position: VectorInput) {
		return new Rect(Vector.from(...position), this.size)
	}

	withSize(...size: VectorInput) {
		return new Rect(this.position, Vector.from(...size))
	}

	translated(position: Vector): Rect {
		return new Rect(this.position.plus(position), this.size)
	}

	scaledBy(amount: number): Rect {
		return new Rect(this.position, this.size.times(amount))
	}

	withMinimumSize(...size: VectorInput): Rect {
		const sizeVector = Vector.from(...size)
		return this.withSize(
			Vector.from(Math.max(sizeVector.x, this.size.x), Math.max(sizeVector.y, this.size.y)),
		)
	}
}
