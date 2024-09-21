export function typedKeys<T extends Record<string, unknown>>(object: T) {
	return Object.keys(object) as ReadonlyArray<keyof T>
}
