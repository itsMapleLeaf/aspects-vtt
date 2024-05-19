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

export function omit<T extends object, K extends keyof T>(
	obj: T,
	keys: K[],
): StrictOmit<T, K> {
	const result = { ...obj }
	for (const key of keys) {
		delete result[key]
	}
	return result as StrictOmit<T, K>
}

export function* keys<T extends object>(obj: T): Iterable<keyof T> {
	for (const key in obj) {
		yield key
	}
}
