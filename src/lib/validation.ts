import { mapValues } from "lodash-es"
import * as v from "valibot"

export function formDataSchema() {
	return v.pipe(
		v.instance(FormData),
		v.transform((input) => {
			const entries = Object.fromEntries(input)
			return mapValues(entries, (value) => {
				if (typeof value === "string" && value.length === 0) {
					return undefined
				}
				if (value instanceof File && value.size === 0) {
					return undefined
				}
				return value
			})
		}),
	)
}

export function formNumberSchema() {
	return v.pipe(v.string(), v.transform(Number), v.finite())
}
