import { Vector, type VectorInput } from "./vector.ts"

export type RectInput =
	| { x: number; y: number; width: number; height: number }
	| { left: number; top: number; width: number; height: number }
	| { position: Vector; size: Vector }
	| { topLeft: Vector; bottomRight: Vector }

export class Rect {
	readonly position: Vector
	readonly size: Vector

	constructor(position: Vector, size: Vector) {
		this.position = position
		this.size = size
	}

	static from(input: RectInput): Rect {
		if ("x" in input) {
			return new Rect(Vector.from(input), Vector.fromSize(input))
		}
		if ("left" in input) {
			return new Rect(Vector.from(input.left, input.top), Vector.fromSize(input))
		}
		if ("position" in input) {
			return new Rect(input.position, input.size)
		}
		return new Rect(input.topLeft, input.bottomRight)
	}

	/** @deprecated Use {@link from} */
	static fromComponents(x: number, y: number, width: number, height: number): Rect {
		return new Rect(Vector.from(x, y), Vector.from(width, height))
	}

	/** @deprecated Use {@link from} */
	static fromCorners(topLeft: Vector, bottomRight: Vector): Rect {
		return new Rect(Vector.topLeftMost(topLeft, bottomRight), topLeft.minus(bottomRight).abs)
	}

	get x(): number {
		return this.position.x
	}

	get y(): number {
		return this.position.y
	}

	get width(): number {
		return this.size.x
	}

	get height(): number {
		return this.size.y
	}

	get left(): number {
		return this.position.x
	}

	get right(): number {
		return this.position.x + this.width
	}

	get top(): number {
		return this.position.y
	}

	get bottom(): number {
		return this.position.y + this.height
	}

	get topLeft(): Vector {
		return this.position
	}

	get bottomRight(): Vector {
		return this.position.plus(this.size)
	}

	get tuple(): readonly [left: number, top: number, width: number, height: number] {
		const { left, top, width, height } = this
		return [left, top, width, height] as const
	}

	withPosition(...position: VectorInput): Rect {
		return new Rect(Vector.from(...position), this.size)
	}

	withSize(...size: VectorInput): Rect {
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

	overlaps(input: RectInput): boolean {
		const other = Rect.from(input)
		return (
			this.left < other.right &&
			this.right > other.left &&
			this.top < other.bottom &&
			this.bottom > other.top
		)
	}
}
