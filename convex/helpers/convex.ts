import { type PropertyValidators, type Validator, v } from "convex/values"
import { Result } from "../../app/common/Result.ts"
import { raise } from "../../app/common/errors.ts"
import type { Id, TableNames } from "../_generated/dataModel.js"
import type { QueryCtx } from "../_generated/server.js"

export type Branded<T> = string & { _: T }

export const nullish = <V extends Validator<NonNullable<unknown>, false, string>>(validator: V) =>
	v.optional(v.union(v.null(), validator))

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
		[K in keyof T]: T[K] extends Validator<infer V, false, infer F>
			? Validator<V | undefined, true, F>
			: T[K]
	}
}
