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

export function unwrap<T>(value: T, message?: string): NonNullable<T> {
	if (value == null) {
		throw new Error(message ?? `unexpected: value is ${String(value)}`)
	}
	return value
}
