export function isNonNil<T>(value: T): value is NonNullable<T> {
	return value != null
}
