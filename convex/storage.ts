import { mutation } from "./_generated/server"

export const getUploadUrl = mutation({
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl()
	},
})
