/**
 * A type representing either a value, or a function that takes some arguments
 * and returns that value.
 */
export type MaybeFunction<Args extends unknown[], Result> =
	| Result
	| ((...args: Args) => Result)

/**
 * Same as Omit, but with a restricted Key type, and also distributes over
 * unions.
 *
 * @example
 * 	type A = { a: string } | { b: number }
 *
 * 	type Bad = Omit<A, "a"> // {}
 * 	type Good = StrictOmit<A, "a"> // {} | { b: number }
 */
export type StrictOmit<T, K extends AllKeys<T>> = T extends unknown
	? Simplify<Omit<T, K>>
	: never

/**
 * Gets all the keys of every object type in a union.
 *
 * @example
 * 	type A = { a: string } | { b: number }
 * 	type Bad = keyof A // never
 * 	type Good = AllKeys<A> // "a" | "b"
 */
export type AllKeys<T> = T extends object ? keyof T : never

/** Makes a type more readable. */
export type Simplify<T> = { [K in keyof T]: T[K] } & {}

export type Nullish<T> = T | null | undefined

export type StringKeys<T> = keyof T & string

export const typed = <T>(value: T) => value

/* Alias for "anything but null or undefined" */
export type Something = NonNullable<unknown>

/* An explicit alias for "unknown" that doesn't swallow other values in unions. */
export type Anything = Something | Nil

/* Alias for `undefined | null` */
export type Nil = undefined | null

export type PickUnion<T, K extends AllKeys<T>> = T extends object
	? K extends keyof T
		? T[K]
		: never
	: never
