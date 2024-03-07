export function acceptPositiveInteger(input: unknown) {
	const number = Number(input)
	if (Number.isInteger(number) && number > 0) {
		return number
	}
}
