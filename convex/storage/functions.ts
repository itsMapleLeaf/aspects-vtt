import { v } from "convex/values"
import { internalQuery, mutation } from "../_generated/server.js"
import { effectMutation, withMutationCtx } from "../helpers/effect.ts"

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

export const remove = effectMutation({
	args: {
		storageId: v.id("_storage"),
	},
	handler(args) {
		return withMutationCtx((ctx) => ctx.storage.delete(args.storageId))
	},
})
