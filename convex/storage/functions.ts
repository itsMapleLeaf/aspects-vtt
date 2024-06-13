import { v } from "convex/values"
import type { Nullish } from "../../app/common/types.ts"
import type { Id } from "../_generated/dataModel"
import { type MutationCtx, internalQuery, mutation } from "../_generated/server.js"

export const getUploadUrl = mutation({
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl()
	},
})

export const getMetadata = internalQuery({
	args: {
		storageId: v.id("_storage"),
	},
	handler: async (ctx, { storageId }) => {
		return await ctx.db.system.get(storageId)
	},
})

export async function replaceFile(
	ctx: MutationCtx,
	current: Nullish<Id<"_storage">>,
	next: Nullish<Id<"_storage">>,
) {
	if (next === undefined) {
		return current
	}
	if (current) {
		await ctx.storage.delete(current)
	}
	return next
}
