/**
 * Like omit, but ensures the keys exist in the target object,
 * and preserves union types
 */
export type StrictOmit<T, K extends keyof T> =
	T extends object ? Simplify<Pick<T, Exclude<keyof T, K>>> : T

/**
 * Merge two types, overwriting keys in A with keys in B
 */
export type Overwrite<A extends object, B extends object> = Simplify<
	B & StrictOmit<A, Extract<keyof B, keyof A>>
>

/**
 * Simplify complex types into a flat object
 */
export type Simplify<T extends object> = { [K in keyof T]: T[K] } & {}
