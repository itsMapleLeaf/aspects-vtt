import { type PropertyValidators, type Validator, v } from "convex/values"
import { raise } from "../../app/helpers/errors.ts"
import { Result } from "../../app/helpers/Result.ts"
import type { Id, TableNames } from "../_generated/dataModel.js"
import type { QueryCtx } from "../_generated/server.js"

export type Branded<T> = string & { _: T }

export function nullish<V extends Validator<unknown, "required", string>>(validator: V) {
	return v.optional(v.union(v.null(), validator))
}

export function requireDoc<TableName extends TableNames>(
	ctx: QueryCtx,
	id: Id<TableName>,
	tableName: TableName,
) {
	return Result.fn(async () => {
		const doc = await ctx.db.get(id)
		return doc ?? raise(new Error(`document not found: ${tableName}.${id}`))
	})
}

export function partial<T extends PropertyValidators>(obj: T) {
	return Object.fromEntries(
		Object.entries(obj).map(([key, validator]) => [
			key,
			validator.isOptional ? validator : v.optional(validator),
		]),
	) as unknown as {
		[K in keyof T]: T[K] extends Validator<infer V, "required", infer F> ?
			Validator<V | undefined, "optional", F>
		:	T[K]
	}
}
