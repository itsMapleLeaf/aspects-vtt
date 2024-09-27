import { Vec } from "./vec.ts"

export class Region {
	constructor(
		readonly position: Vec,
		readonly size: Vec,
	) {}

	static from(input: { x: number; y: number; width: number; height: number }) {
		return new Region(
			Vec.from([input.x, input.y]),
			Vec.from([input.width, input.height]),
		)
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
		return this.x
	}

	get top() {
		return this.y
	}

	get right() {
		return this.x + this.width
	}

	get bottom() {
		return this.y + this.height
	}

	toJSON() {
		const { x, y, width, height } = this
		return { x, y, width, height }
	}

	intersects(other: Region): boolean {
		return (
			this.left < other.right &&
			this.right > other.left &&
			this.top < other.bottom &&
			this.bottom > other.top
		)
	}
}
