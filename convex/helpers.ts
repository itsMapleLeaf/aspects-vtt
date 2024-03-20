import { type Validator, v } from "convex/values"

export const nullish = <V extends Validator<NonNullable<unknown>, false, string>>(validator: V) =>
	v.optional(v.union(v.null(), validator))
