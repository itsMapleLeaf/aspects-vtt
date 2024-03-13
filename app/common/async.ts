export function timeoutEffect<Args extends unknown[]>(
	delay: number,
	callback: (...args: Args) => void,
	...args: Args
) {
	const timeout = setTimeout(callback, delay, ...args)
	return () => clearTimeout(timeout)
}
