import type { StrictOmit } from "./types.ts"

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
	const result = {} as Pick<T, K>
	for (const key of keys) {
		if (obj[key] !== undefined) {
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
