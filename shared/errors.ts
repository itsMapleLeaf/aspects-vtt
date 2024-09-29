export function raise(input: string | object): never {
	if (typeof input === "string") {
		const error = new Error(input)
		Error.captureStackTrace(error, raise)
		throw error
	}
	throw input
}

export function ensure<Input, Asserted extends Input>(
	input: Input,
	condition: (input: Input) => input is Asserted,
	error?: string | object,
): Asserted {
	return condition(input) ? input : raise(error ?? "Assertion failed")
}

export function ensureSomething<T>(input: T, error?: string | object) {
	return ensure(input, (input) => input != null, error)
}
