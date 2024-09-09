import { Validator, v } from "convex/values"

export function nullish<InputValidator extends Validator<unknown>>(
	validator: InputValidator,
) {
	return v.optional(v.union(v.null(), validator))
}
