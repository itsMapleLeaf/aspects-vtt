export function raise(input: string | object): never {
	if (typeof input === "string") {
		const error = new Error(input)
		if ("captureStackTrace" in Error) {
			Error.captureStackTrace(error, raise)
		}
		throw error
	}
	throw input
}

export function ensure<Input>(value: Input): NonNullable<Input>
export function ensure<Input>(
	value: Input,
	error: string | object,
): NonNullable<Input>
export function ensure<Input, Output extends Input>(
	value: Input,
	check: (input: Input) => input is Output,
): Output
export function ensure<Input, Output extends Input>(
	value: Input,
	check: (input: Input) => input is Output,
	error: string | object,
): Output
export function ensure(
	value: unknown,
	...args:
		| []
		| [error: string | object]
		| [check: (input: unknown) => unknown]
		| [check: (input: unknown) => unknown, error: string | object]
) {
	let error: string | object
	let check: (input: unknown) => unknown

	if (args.length === 0) {
		check = (input: unknown) => input != null
		error = `value is ${value}`
	} else if (args.length === 2) {
		;[check, error] = args
	} else if (args[0] instanceof Function) {
		check = args[0]
		error = `assertion failed`
	} else {
		check = (input: unknown) => input != null
		error = args[0]
	}

	return check(value) ? value : raise(error)
}
