export type ResultTuple<T, E> =
	| readonly [T, undefined]
	| readonly [undefined, E]

export const ok = <T>(value: T): ResultTuple<T, never> => [value, undefined]
export const err = <E>(error: E): ResultTuple<never, E> => [undefined, error]
