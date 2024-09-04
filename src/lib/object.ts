export function mapValues<Input extends Record<PropertyKey, unknown>, OutValue>(
	input: Input,
	mapper: (value: Input[keyof Input]) => OutValue,
) {
	const output: Record<PropertyKey, unknown> = {}
	for (const key in input) {
		output[key] = mapper(input[key])
	}
	return output as Record<keyof Input, OutValue>
}
