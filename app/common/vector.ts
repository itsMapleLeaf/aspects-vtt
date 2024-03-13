type VectorInput =
	| [x: number, y: number]
	| [xy: number]
	| [xy: { x: number; y: number }]
	| [vector: Vector]

export class Vector {
	readonly x: number
	readonly y: number

	private constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	static from(...args: VectorInput): Vector {
		if (args[0] instanceof Vector) {
			return args[0]
		}
		if (typeof args[0] === "object") {
			return new Vector(args[0].x, args[0].y)
		}
		return new Vector(args[0], args[1] ?? args[0])
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

	toObject<X extends PropertyKey, Y extends PropertyKey>(xProp: X, yProp: Y) {
		return { [xProp]: this.x, [yProp]: this.y } as { [K in X | Y]: number }
	}
}
