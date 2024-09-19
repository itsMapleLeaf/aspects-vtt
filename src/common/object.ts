import type { Simplify } from "./types.ts"

export function extract<Input extends object, Key extends keyof Input>(
	fromObject: Input,
	keys: readonly Key[],
) {
	const extracted: Record<PropertyKey, unknown> = {}
	const rest = { ...fromObject } as Record<PropertyKey, unknown>
	for (const key of keys) {
		extracted[key] = rest[key]
		delete rest[key]
	}
	return [
		extracted as Simplify<Pick<Input, Key>>,
		rest as Simplify<Omit<Input, Key>>,
	] as const
}

export function filterValues<Input>(
	record: Record<PropertyKey, Input>,
	predicate: (value: Input) => boolean,
) {
	return Object.fromEntries(
		Object.entries(record).filter((entry) => predicate(entry[1])),
	)
}
