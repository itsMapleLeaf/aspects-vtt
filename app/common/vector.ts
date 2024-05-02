export type VectorInput =
	| { x: number; y: number }
	| { width: number; height: number }
	| [x: number, y: number]
	| Vector
	| number // same number for both components

export type VectorInputArgs = [input: VectorInput] | [x: number, y: number]

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

	static from(...args: VectorInputArgs): Vector {
		if (args.length === 2) {
			return new Vector(...args)
		}
		if (Array.isArray(args[0])) {
			return new Vector(...args[0])
		}
		if (args[0] instanceof Vector) {
			return args[0]
		}
		if (typeof args[0] === "object" && "x" in args[0]) {
			return new Vector(args[0].x, args[0].y)
		}
		if (typeof args[0] === "object" && "width" in args[0]) {
			return new Vector(args[0].width, args[0].height)
		}
		return new Vector(args[0], args[0])
	}

	static fromSize(
		...args: [width: number, height: number] | [size: { width: number; height: number }]
	): Vector {
		if (args.length === 2) {
			return new Vector(args[0], args[1])
		}
		return new Vector(args[0].width, args[0].height)
	}

	static topLeftMost(firstInput: VectorInput, secondInput: VectorInput): Vector {
		const first = Vector.from(firstInput)
		const second = Vector.from(secondInput)
		return Vector.from(Math.min(first.x, second.x), Math.min(first.y, second.y))
	}

	static bottomRightMost(firstInput: VectorInput, secondInput: VectorInput): Vector {
		const first = Vector.from(firstInput)
		const second = Vector.from(secondInput)
		return Vector.from(Math.max(first.x, second.x), Math.max(first.y, second.y))
	}

	static normalizeRange(start: VectorInput, end: VectorInput) {
		return [Vector.topLeftMost(start, end), Vector.bottomRightMost(start, end)] as const
	}

	get xy(): { x: number; y: number } {
		return { x: this.x, y: this.y }
	}

	get tuple(): readonly [number, number] {
		return [this.x, this.y]
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

	get abs(): Vector {
		return this.map(Math.abs)
	}

	toString(): string {
		return `(${this.x}, ${this.y})`
	}

	roundedTo(multiple: number): Vector {
		return this.map((n) => Math.round(n / multiple) * multiple)
	}

	floorTo(multiple: number): Vector {
		return this.map((n) => Math.floor(n / multiple) * multiple)
	}

	ceilingTo(multiple: number): Vector {
		return this.map((n) => Math.ceil(n / multiple) * multiple)
	}

	plus(...input: VectorInputArgs): Vector {
		const b = Vector.from(...input)
		return new Vector(this.x + b.x, this.y + b.y)
	}

	minus(...input: VectorInputArgs): Vector {
		const b = Vector.from(...input)
		return new Vector(this.x - b.x, this.y - b.y)
	}

	times(...input: VectorInputArgs): Vector {
		const other = Vector.from(...input)
		return new Vector(this.x * other.x, this.y * other.y)
	}

	dividedBy(...input: VectorInputArgs): Vector {
		const other = Vector.from(...input)
		return new Vector(this.x / other.x, this.y / other.y)
	}

	distanceTo(...input: VectorInputArgs): number {
		return this.minus(...input).length
	}

	manhattanDistanceTo(...input: VectorInputArgs): number {
		const b = Vector.from(...input)
		return Math.abs(this.x - b.x) + Math.abs(this.y - b.y)
	}

	lerp(other: Vector, t: number): Vector {
		return this.plus(other.minus(this).times(t))
	}

	map(fn: (n: number) => number): Vector {
		return new Vector(fn(this.x), fn(this.y))
	}

	clampTopLeft(...topLeftInput: VectorInputArgs): Vector {
		const topLeft = Vector.from(...topLeftInput)
		return new Vector(Math.max(this.x, topLeft.x), Math.max(this.y, topLeft.y))
	}

	clampBottomRight(...bottomRightInput: VectorInputArgs): Vector {
		const bottomRight = Vector.from(...bottomRightInput)
		return new Vector(Math.min(this.x, bottomRight.x), Math.min(this.y, bottomRight.y))
	}

	clamp(topLeft: Vector, bottomRight: Vector): Vector {
		return this.clampTopLeft(topLeft).clampBottomRight(bottomRight)
	}

	toObject<X extends PropertyKey, Y extends PropertyKey>(xProp: X, yProp: Y) {
		return { [xProp]: this.x, [yProp]: this.y } as { [K in X | Y]: number }
	}

	toSize() {
		return { width: this.x, height: this.y }
	}

	equals(...input: VectorInputArgs) {
		const other = Vector.from(...input)
		return this.x === other.x && this.y === other.y
	}

	readonly css = {
		translate: () => `${this.x}px ${this.y}px`,
	}
}
