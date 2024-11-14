import {
	Validator,
	v,
	type OptionalProperty,
	type VOptional,
} from "convex/values"
import { Simplify } from "type-fest"
import schema from "~/convex/schema.ts"

export function partial<
	Fields extends Record<string, Validator<unknown, OptionalProperty, string>>,
>(fields: Fields) {
	const result: Record<string, unknown> = {}

	for (const key in fields) {
		const field = fields[key]!
		if (field.isOptional === "required") {
			result[key] = v.optional(field)
		} else {
			result[key] = field
		}
	}

	return result as {
		[K in keyof Fields]: Fields[K]["isOptional"] extends "required"
			? VOptional<Fields[K]>
			: Fields[K]
	}
}

export function nullish<InputValidator extends Validator<unknown>>(
	validator: InputValidator,
) {
	return v.optional(v.union(v.null(), validator))
}

type Tables = typeof schema.tables

export function tableFields<T extends keyof Tables>(table: T) {
	const fields = schema.tables[table].validator
		.fields as Tables[T]["validator"]["fields"]
	if ("FieldName" in fields) {
		const { FieldName: _, ...rest } = fields
		return rest as Simplify<Omit<Tables[T]["validator"]["fields"], "FieldName">>
	}
	return fields as Simplify<Tables[T]["validator"]["fields"]>
}
