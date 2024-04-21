import { type Validator, v } from "convex/values"
import { Result } from "#app/common/Result.js"
import { raise } from "#app/common/errors.js"
import type { Id, TableNames } from "#convex/_generated/dataModel.js"
import type { QueryCtx } from "#convex/_generated/server.js"

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
