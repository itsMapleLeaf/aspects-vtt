import { isNonNil } from "./guards.ts"

export function assert<Value>(
	value: Value,
	message?: string,
): NonNullable<Value>

export function assert<Value>(
	value: Value,
	message?: string,
	assertion?: (value: Value) => boolean,
): Value

export function assert<Value, Asserted extends Value>(
	value: Value,
	message?: string,
	assertion?: (value: Value) => value is Asserted,
): Asserted

export function assert<Value>(
	value: Value,
	message = "Assertion failed",
	assertion: (value: Value) => boolean = isNonNil,
) {
	if (assertion(value)) {
		return value
	}

	const error = new Error(message)
	Error.captureStackTrace(error, assert)
	throw error
}
