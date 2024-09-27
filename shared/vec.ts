import { match, P } from "ts-pattern"

export declare namespace Vec {
	export type Input =
		| Vec
		| { x: number; y: number }
		| number
		| [x: number, y: number]
}

export class Vec {
	constructor(
		readonly x: number,
		readonly y: number,
	) {}

	static from(input: Vec.Input): Vec {
		return match(input)
			.with(P.instanceOf(Vec), (vec) => vec)
			.with({ x: P.number, y: P.number }, ({ x, y }) => new Vec(x, y))
			.with(P.number, (num) => new Vec(num, num))
			.with([P.number, P.number], ([x, y]) => new Vec(x, y))
			.exhaustive()
	}

	toString() {
		return `(${this.x}, ${this.y})`
	}

	toJSON() {
		return { x: this.x, y: this.y }
	}

	zip(input: Vec.Input, fn: (a: number, b: number) => number) {
		const other = Vec.from(input)
		return new Vec(fn(this.x, other.x), fn(this.y, other.y))
	}

	add(input: Vec.Input): Vec {
		return this.zip(input, (a, b) => a + b)
	}

	subtract(input: Vec.Input): Vec {
		return this.zip(input, (a, b) => a - b)
	}

	multiply(input: Vec.Input): Vec {
		return this.zip(input, (a, b) => a * b)
	}

	divide(input: Vec.Input): Vec {
		return this.zip(input, (a, b) => a / b)
	}

	neg(): Vec {
		return this.multiply(-1)
	}

	roundTo(input: Vec.Input): Vec {
		return this.zip(input, (a, b) => Math.round(a / b) * b)
	}
}
