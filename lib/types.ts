export type MaybeFunction<Args extends unknown[], Result> =
	| Result
	| ((...args: Args) => Result)
