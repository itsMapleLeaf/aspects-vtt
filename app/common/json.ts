export type JsonValue =
	| number
	| string
	| boolean
	| null
	| JsonValue[]
	| JsonObject

export type JsonObject = { [_ in string]: JsonValue }

export function prettify(value: unknown) {
	try {
		return JSON.stringify(value, undefined, 2)
	} catch {
		return String(value)
	}
}
