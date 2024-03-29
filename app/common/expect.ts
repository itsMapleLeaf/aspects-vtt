export function expect<T>(value: T | undefined | null, message: string): T {
	if (value == null) throw new Error(message)
	return value
}
