export function raise(input: string | object, context?: (...args: never[]) => unknown): never {
	if (typeof input === "string") {
		throw new Error(input)
	}
	if (context) {
		Error.captureStackTrace(input, context)
	}
	throw input
}
