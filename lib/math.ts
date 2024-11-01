export function lerp(a: number, b: number, t: number) {
	return a * (1 - t) + b * t
}

export function delta(value: number, min: number, max: number) {
	return (value - min) / (max - min)
}

export function roundTo(num: number, multiple: number) {
	return Math.round(num / multiple) * multiple
}

export const ByteUnit = {
	B: "B",
	KB: "KB",
	MB: "MB",
	GB: "GB",
} as const

type ByteUnitType = (typeof ByteUnit)[keyof typeof ByteUnit]

const unitFactors: Record<ByteUnitType, bigint> = {
	[ByteUnit.B]: 1n,
	[ByteUnit.KB]: 1024n,
	[ByteUnit.MB]: 1024n * 1024n,
	[ByteUnit.GB]: 1024n * 1024n * 1024n,
}

/**
 * Converts a byte value from one unit to another.
 *
 * @example
 * 	const result = convertBytes(1, ByteUnit.GB, ByteUnit.MB)
 * 	console.log(result) // 1024
 *
 * @param input - The input value to convert
 * @param inputUnit - The unit of the input value
 * @param outputUnit - The desired output unit
 * @returns The converted value, rounded to two decimal places
 */
export function convertBytes(
	input: number,
	inputUnit: ByteUnitType,
	outputUnit: ByteUnitType,
): number {
	const inputBytes = BigInt(Math.round(input * 100)) * unitFactors[inputUnit]
	const result = Number(inputBytes) / (Number(unitFactors[outputUnit]) * 100)

	return Number(result.toFixed(2))
}

/** Like the `%` modulus operator, but loops on negative numbers */
export function mod(n: number, m: number) {
	return ((n % m) + m) % m
}
