import type { Equal, Expect } from "./types.ts"

/**
 * Returns a random integer between min and max (inclusive).
 *
 * When passed a single number, it will return a random integer between 1 and
 * that number (inclusive).
 */
export function randomInt(...args: [min: number, max: number] | [max: number]) {
	const [min, max] = args.length === 1 ? [1, args[0]] : args
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function roll(sides: number) {
	return randomInt(1, sides)
}

export function randomItem<const T extends Iterable<unknown>>(input: T) {
	const items = [...input]
	return items[randomInt(items.length) - 1] as IndexedValue<T>
}

type IndexedValue<T extends Iterable<unknown>> =
	T extends readonly [unknown, ...unknown[]] ? T[number]
	: T extends Iterable<infer U> ? U | undefined
	: never

type _Test_IndexedValueReturnsNonUndefinedForNonEmptyArray = Expect<
	Equal<IndexedValue<["a", "b", "c"]>, "a" | "b" | "c">
>

type _Test_IndexedValueReturnsUndefinedIterable = Expect<
	| Equal<IndexedValue<string[]>, string | undefined>
	| Equal<IndexedValue<Iterable<string>>, string | undefined>
	| Equal<IndexedValue<[]>, undefined>
>
