import { Validator, v } from "convex/values"
import schema from "~/convex/schema.ts"

export function nullish<InputValidator extends Validator<unknown>>(
	validator: InputValidator,
) {
	return v.optional(v.union(v.null(), validator))
}

export function tableFields<T extends keyof typeof schema.tables>(table: T) {
	return schema.tables[table].validator.fields
}
