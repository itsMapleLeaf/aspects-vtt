import * as v from "valibot"

export * as vfd from "./valibot-form-data.ts"

export function formData<
	const Entries extends {
		[key: string]: v.GenericSchema<any>
	},
>(entries: Entries) {
	return v.pipe(
		v.instance(FormData),
		v.transform((data) => Object.fromEntries(data)),
		v.object(entries),
	)
}

export function text() {
	return v.string()
}

export function number() {
	return v.pipe(
		v.string(),
		v.transform((input) => parseInt(input, 10)),
		v.finite(),
	)
}

export function file() {
	return v.pipe(
		v.instance(File),
		v.check((input) => input.size > 0),
	)
}
