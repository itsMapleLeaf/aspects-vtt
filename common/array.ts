import type { NonEmptyTuple, ReadonlyTuple } from "type-fest"
import { mod } from "./math.ts"

export function withMovedItem<T>(
	array: readonly T[],
	fromIndex: number,
	toIndex: number,
): T[] {
	if (array.length === 0) return array as T[]

	if (!Number.isInteger(fromIndex)) {
		throw new Error(`fromIndex must be an integer, received ${fromIndex}`)
	}

	if (!Number.isInteger(toIndex)) {
		throw new Error(`toIndex must be an integer, received ${toIndex}`)
	}

	if (fromIndex === toIndex) {
		return array as T[]
	}

	if (fromIndex < 0 || fromIndex >= array.length) {
		throw new Error(
			`fromIndex (${fromIndex}) is out of range (0 to ${array.length - 1})`,
		)
	}

	if (toIndex < 0 || toIndex >= array.length) {
		throw new Error(
			`toIndex (${toIndex}) is out of range (0 to ${array.length - 1})`,
		)
	}

	const result = [...array]
	result.splice(toIndex, 0, ...result.splice(fromIndex, 1))
	return result
}

export function indexLooped<T>(array: readonly T[], index: number) {
	return array[mod(index, array.length)]
}

export function chunk<T>(array: readonly T[], chunkSize: number): T[][] {
	const result: T[][] = []
	for (let i = 0; i < array.length; i += chunkSize) {
		result.push(array.slice(i, i + chunkSize))
	}
	return result
}

export function upsertArray<T>(
	array: readonly T[],
	condition: (item: T) => boolean,
	update: (item: T) => T,
	create: () => T,
) {
	for (const [index, item] of array.entries()) {
		if (condition(item)) {
			return array.with(index, update(item))
		}
	}
	return [...array, create()]
}

export function nonEmpty<T>(items: Iterable<T>): NonEmptyTuple<T> {
	const [first, ...rest] = items
	if (first === undefined) {
		throw new Error("Expected non-empty iterable")
	}
	return [first, ...rest]
}

export function hasLength<Value, Length extends number>(
	items: readonly Value[],
	length: Length,
): items is ReadonlyTuple<Value, Length> {
	return items.length === length
}
