type VectorInput =
	| [x: number, y: number]
	| [xy: number]
	| [xy: { x: number; y: number }]
	| [size: { width: number; height: number }]
	| [vector: Vector]

export class Vector {
	readonly x: number
	readonly y: number

	private constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	static readonly zero = new Vector(0, 0)
	static readonly one = new Vector(1, 1)
	static readonly up = new Vector(0, -1)
	static readonly down = new Vector(0, 1)
	static readonly left = new Vector(-1, 0)
	static readonly right = new Vector(1, 0)

	static from(...args: VectorInput): Vector {
		if (args[0] instanceof Vector) {
			return args[0]
		}
		if (typeof args[0] === "object" && "x" in args[0]) {
			return new Vector(args[0].x, args[0].y)
		}
		if (typeof args[0] === "object" && "width" in args[0]) {
			return new Vector(args[0].width, args[0].height)
		}
		return new Vector(args[0], args[1] ?? args[0])
	}

	get xy(): { x: number; y: number } {
		return { x: this.x, y: this.y }
	}

	get length(): number {
		return (this.x * this.x + this.y * this.y) ** 0.5
	}

	get normalized(): Vector {
		return this.dividedBy(this.length)
	}

	get min(): number {
		return Math.min(this.x, this.y)
	}

	get max(): number {
		return Math.max(this.x, this.y)
	}

	get rounded(): Vector {
		return this.map(Math.round)
	}

	get floor(): Vector {
		return this.map(Math.floor)
	}

	get ceiling(): Vector {
		return this.map(Math.ceil)
	}

	roundedTo(multiple: number): Vector {
		return this.map((n) => Math.round(n / multiple) * multiple)
	}

	plus(...input: VectorInput): Vector {
		const b = Vector.from(...input)
		return new Vector(this.x + b.x, this.y + b.y)
	}

	minus(...input: VectorInput): Vector {
		const b = Vector.from(...input)
		return new Vector(this.x - b.x, this.y - b.y)
	}

	times(b: number): Vector {
		return new Vector(this.x * b, this.y * b)
	}

	dividedBy(b: number): Vector {
		return new Vector(this.x / b, this.y / b)
	}

	distanceTo(...input: VectorInput): number {
		return this.minus(...input).length
	}

	manhattanDistanceTo(...input: VectorInput): number {
		const b = Vector.from(...input)
		return Math.abs(this.x - b.x) + Math.abs(this.y - b.y)
	}

	map(fn: (n: number) => number): Vector {
		return new Vector(fn(this.x), fn(this.y))
	}

	clampTopLeft(...topLeftInput: VectorInput): Vector {
		const topLeft = Vector.from(...topLeftInput)
		return new Vector(Math.max(this.x, topLeft.x), Math.max(this.y, topLeft.y))
	}

	clampBottomRight(...bottomRightInput: VectorInput): Vector {
		const bottomRight = Vector.from(...bottomRightInput)
		return new Vector(Math.min(this.x, bottomRight.x), Math.min(this.y, bottomRight.y))
	}

	clamp(topLeft: Vector, bottomRight: Vector): Vector {
		return this.clampTopLeft(topLeft).clampBottomRight(bottomRight)
	}

	toObject<X extends PropertyKey, Y extends PropertyKey>(xProp: X, yProp: Y) {
		return { [xProp]: this.x, [yProp]: this.y } as { [K in X | Y]: number }
	}
}
