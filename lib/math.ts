export function lerp(a: number, b: number, t: number) {
	return a * (1 - t) + b * t
}

export function convertBytes(
	input: number,
	inputUnit: "B" | "KB" | "MB" | "GB",
	outputUnit: "B" | "KB" | "MB" | "GB",
) {
	const inputBytes =
		input *
		(inputUnit === "GB" ? 1024 ** 3
		: inputUnit === "MB" ? 1024 ** 2
		: inputUnit === "KB" ? 1024 ** 1
		: 1024 ** 0)

	return (
		inputBytes /
		(outputUnit === "GB" ? 1024 ** 3
		: outputUnit === "MB" ? 1024 ** 2
		: outputUnit === "KB" ? 1024 ** 1
		: 1024 ** 0)
	)
}
