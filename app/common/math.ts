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
