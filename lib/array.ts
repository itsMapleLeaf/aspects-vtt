import { FixedLengthArray } from "type-fest"

/**
 * An empty array helper constant for places that need referential equality,
 * like `useMemo`
 */
export const EMPTY_ARRAY: readonly [] = []

export function hasLength<T, const Length extends number>(
	array: readonly T[],
	length: Length,
): array is FixedLengthArray<T, Length> {
	return array.length === length
}
