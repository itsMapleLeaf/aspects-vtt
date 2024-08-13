import { type Validator, v } from "convex/values"
import { Result } from "../../common/Result.ts"
import { raise } from "../../common/errors.ts"
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
