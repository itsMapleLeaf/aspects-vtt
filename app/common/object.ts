import type { Simplify, StrictOmit } from "./types.ts"

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Simplify<Pick<T, K>> {
	const result = {} as Pick<T, K>
	for (const key of keys) {
		if (key in obj) {
			result[key] = obj[key]
		}
	}
	return result
}

export function omit<T, K extends keyof T>(obj: T, keys: K[]): StrictOmit<T, K> {
	const result = { ...obj }
	for (const key of keys) {
		delete result[key]
	}
	return result as StrictOmit<T, K>
}
