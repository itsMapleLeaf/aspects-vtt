export function timeoutEffect<Args extends unknown[]>(
	delay: number,
	callback: (...args: Args) => void,
	...args: Args
) {
	const timeout = setTimeout(callback, delay, ...args)
	return () => clearTimeout(timeout)
}

export async function promiseAllObject<
	Promises extends Record<string, unknown>,
>(promises: Promises) {
	const result: Record<string, unknown> = {}
	await Promise.all(
		Object.entries(promises).map(async ([key, promise]) => {
			result[key] = await promise
		}),
	)
	return result as { [K in keyof Promises]: Awaited<Promises[K]> }
}

export async function parallel<In, Out>(
	inputs: Iterable<In>,
	fn: (input: In) => Promise<Out>,
) {
	return Promise.all([...inputs].map(fn))
}
