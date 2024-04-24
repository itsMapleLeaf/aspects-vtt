import { Vector } from "./vector.ts"

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
}
