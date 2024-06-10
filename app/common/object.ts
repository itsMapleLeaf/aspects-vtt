import type { Simplify, StrictOmit } from "./types.ts"

export function pick<T extends object, K extends PropertyKey>(
	obj: T,
	keys: K[],
): Simplify<Pick<T, Extract<K, keyof T>>> {
	const result = {} as Pick<T, Extract<K, keyof T>>
	for (const key of keys) {
		if (key in obj) {
			result[key as keyof typeof result] = obj[key as keyof typeof result]
		}
	}
	return result
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): StrictOmit<T, K> {
	const result = { ...obj }
	for (const key of keys) {
		delete result[key]
	}
	return result as StrictOmit<T, K>
}

export function* keys<T extends object>(obj: T) {
	for (const key in obj) {
		yield key
	}
}

export function fromEntries<K extends PropertyKey, V>(
	entries: Iterable<readonly [K, V]>,
): Record<K, V> {
	return Object.fromEntries(entries) as Record<K, V>
}

export function mapValues<In, Out>(
	obj: Record<string, In>,
	fn: (value: In) => Out,
): Record<string, Out> {
	return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value)]))
}
