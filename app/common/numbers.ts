/** Converts a value to a number and rounds to the nearest positive integer, or undefined if it can't be converted */
export function toNearestPositiveInt(value: unknown): number | undefined {
	const number = toPositiveNumber(value)
	return number !== undefined ? Math.round(number) : undefined
}

/** Converts a value to a positive number, or undefined if it can't be converted */
export function toPositiveNumber(value: unknown): number | undefined {
	const number = Number(value)
	return Number.isFinite(number) ? Math.max(0, number) : undefined
}
