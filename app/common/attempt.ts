export type SafeCallResult<Return> =
	| [result: Awaited<Return>, error: undefined]
	| [result: undefined, error: NonNullable<unknown>]

/**
 * Attempts to call a function and returns the result or an error.
 */
export async function safeCall<Args extends unknown[], Return>(
	fn: (...args: Args) => Return,
	...args: Args
): Promise<SafeCallResult<Return>> {
	try {
		return [await fn(...args), undefined]
	} catch (error) {
		return [undefined, error ?? new Error("Unknown error")]
	}
}
