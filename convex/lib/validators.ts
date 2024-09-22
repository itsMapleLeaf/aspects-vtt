import { Validator, v } from "convex/values"
import schema from "~/convex/schema.ts"

export function nullish<InputValidator extends Validator<unknown>>(
	validator: InputValidator,
) {
	return v.optional(v.union(v.null(), validator))
}

type Tables = typeof schema.tables

export function tableFields<T extends keyof Tables>(
	table: T,
): Tables[T]["validator"]["fields"] {
	return schema.tables[table].validator.fields
}
