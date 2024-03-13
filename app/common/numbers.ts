/** Converts a value to a positive integer, or undefined if it can't be converted */
export function toNearestPositiveInt(value: unknown): number | undefined {
	const number = Number(value)
	return Number.isFinite(number) ? Math.max(0, Math.round(number)) : undefined
}
