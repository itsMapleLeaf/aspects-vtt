import { z } from "zod"

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

export const jsonTextParser = z.string().transform((text) => JSON.parse(text))
