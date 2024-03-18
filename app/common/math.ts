export function clamp(value: number, min: number, max: number): number {
	return value > max ? max : value < min ? min : value
}

export function roundToNearest(value: number, multiple: number): number {
	return Math.round(value / multiple) * multiple
}
