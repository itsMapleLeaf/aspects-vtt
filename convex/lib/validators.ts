import {
	Validator,
	v,
	type OptionalProperty,
	type VOptional,
} from "convex/values"
import { omit } from "lodash-es"
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

export function tableFields<T extends keyof Tables>(
	table: T,
): Omit<Tables[T]["validator"]["fields"], "FieldName"> {
	return omit<Tables[T]["validator"]["fields"], ["FieldName"]>(
		schema.tables[table].validator.fields,
		"FieldName",
	)
}
