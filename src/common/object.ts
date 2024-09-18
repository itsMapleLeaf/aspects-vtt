import type { Simplify } from "./types.ts"

export function extract<
	Input extends Record<PropertyKey, unknown>,
	Key extends keyof Input | (string & {}),
>(fromObject: Input, keys: Key[]) {
	const extracted: Record<PropertyKey, unknown> = {}
	const rest: Record<PropertyKey, unknown> = { ...fromObject }
	for (const key of keys) {
		extracted[key] = rest[key]
		delete rest[key]
	}
	return [
		extracted as Simplify<Pick<Input, Key>>,
		rest as Simplify<Omit<Input, Key>>,
	] as const
}
