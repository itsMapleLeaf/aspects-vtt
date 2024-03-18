import { ConvexError, type Validator, v } from "convex/values"
import type { Id, TableNames } from "./_generated/dataModel.js"
import type { QueryCtx } from "./_generated/server.js"

export async function requireDoc<T extends TableNames>(ctx: QueryCtx, table: T, id: Id<T>) {
	const doc = await ctx.db.get(id)
	if (!doc) {
		throw new ConvexError(`Document "${id}" not found in table "${table}"`)
	}
	return doc
}

export const nullish = <V extends Validator<NonNullable<unknown>, false, string>>(validator: V) =>
	v.optional(v.union(v.null(), validator))
