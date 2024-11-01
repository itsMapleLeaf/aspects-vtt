import { match, P } from "ts-pattern"
import { safeStringify } from "~/lib/common.ts"

export type VecInput =
	| { x: number; y: number }
	| [x: number, y: number]
	| number

export class Vec {
	static readonly zero = Vec.of(0)
	static readonly one = Vec.of(1)
	static readonly left = Vec.of(-1, 0)
	static readonly right = Vec.of(1, 0)
	static readonly up = Vec.of(0, -1)
	static readonly down = Vec.of(0, 1)

	static of(x = 0, y = x) {
		return new Vec(x, y)
	}

	static from(input: VecInput): Vec {
		if (input instanceof Vec) {
			return input
		}
		return match(input)
			.with({ x: P.number, y: P.number }, ({ x, y }) => new Vec(x, y))
			.with([P.number, P.number], ([x, y]) => new Vec(x, y))
			.with(P.number, (num) => new Vec(num, num))
			.otherwise(() => {
				throw new Error(`Invalid Vec input: ${safeStringify(input)}`)
			})
	}

	static size(
		...args:
			| [width: number, height: number]
			| [{ width: number; height: number }]
	) {
		return match(args)
			.with([P.number, P.number], ([width, height]) => new Vec(width, height))
			.with(
				[{ width: P.number, height: P.number }],
				([{ width, height }]) => new Vec(width, height),
			)
			.exhaustive()
	}

	static sum(...inputs: VecInput[]): Vec {
		return inputs.map(Vec.from).reduce((a, b) => a.plus(b), Vec.zero)
	}

	private constructor(
		readonly x: number,
		readonly y: number,
	) {}

	get length() {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	toString() {
		return `(${this.x}, ${this.y})`
	}

	toJSON() {
		return { x: this.x, y: this.y }
	}

	toCSSPixels() {
		return `${this.x}px, ${this.y}px`
	}

	zip(input: VecInput, fn: (a: number, b: number) => number) {
		const other = Vec.from(input)
		return new Vec(fn(this.x, other.x), fn(this.y, other.y))
	}

	plus(input: VecInput): Vec {
		return this.zip(input, (a, b) => a + b)
	}

	minus(input: VecInput): Vec {
		return this.zip(input, (a, b) => a - b)
	}

	times(input: VecInput): Vec {
		return this.zip(input, (a, b) => a * b)
	}

	dividedBy(input: VecInput): Vec {
		return this.zip(input, (a, b) => a / b)
	}

	invert(): Vec {
		return this.times(-1)
	}

	roundTo(input: VecInput): Vec {
		return this.zip(input, (a, b) => Math.round(a / b) * b)
	}

	equals(input: VecInput) {
		const other = Vec.from(input)
		return this.x === other.x && this.y === other.y
	}

	distanceTo(input: VecInput) {
		const other = Vec.from(input)
		const dx = this.x - other.x
		const dy = this.y - other.y
		return Math.sqrt(dx * dx + dy * dy)
	}
}
