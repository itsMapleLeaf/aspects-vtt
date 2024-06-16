export function expect<T>(value: T, message?: string): NonNullable<T> {
	if (value == null) {
		throw new Error(message ?? `unexpected: value is ${String(value)}`)
	}
	return value
}
