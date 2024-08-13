export function clamp(value: number, min: number, max: number): number {
	if (value < min) return min
	if (value > max) return max
	return value
}

export function roundToNearest(value: number, multiple: number): number {
	return Math.round(value / multiple) * multiple
}

export function mod(a: number, b: number): number {
	return ((a % b) + b) % b
}

export function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t
}

/**
 * Converts a value to a number and rounds to the nearest positive integer, or
 * undefined if it can't be converted
 */
export function toNearestPositiveInt(value: unknown): number | undefined {
	const number = toPositiveNumber(value)
	return number !== undefined ? Math.round(number) : undefined
}

/** Converts a value to a positive number, or undefined if it can't be converted */
export function toPositiveNumber(value: unknown): number | undefined {
	const number = Number(value)
	return Number.isFinite(number) ? Math.max(0, number) : undefined
}
