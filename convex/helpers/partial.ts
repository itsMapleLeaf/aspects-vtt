import { type PropertyValidators, v, type Validator } from "convex/values"

export function partial<T extends PropertyValidators>(obj: T) {
	return Object.fromEntries(
		Object.entries(obj).map(([key, validator]) => [
			key,
			validator.isOptional === "optional" ? validator : v.optional(validator),
		]),
	) as unknown as {
		[K in keyof T]: T[K] extends Validator<infer V, "required", infer F> ?
			Validator<V | undefined, "optional", F>
		:	T[K]
	}
}
