export function raise(
	input: string | object | symbol,
	context?: (...args: never[]) => unknown,
): never {
	if (typeof input === "string") {
		throw new Error(input)
	}
	if (context && typeof input === "object") {
		Error.captureStackTrace(input, context)
	}
	throw input
}
