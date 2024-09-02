import { FixedLengthArray } from "type-fest"

export function hasLength<T, const Length extends number>(
	array: readonly T[],
	length: Length,
): array is FixedLengthArray<T, Length> {
	return array.length === length
}
