export type JsonValue =
	| number
	| string
	| boolean
	| null
	| JsonValue[]
	| JsonObject

export type JsonObject = {
	[key: string]: JsonValue | undefined
}

export function prettify(value: unknown) {
	try {
		return JSON.stringify(value, undefined, 2)
	} catch {
		return String(value)
	}
}
