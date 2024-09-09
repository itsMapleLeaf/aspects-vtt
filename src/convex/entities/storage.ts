import { mutation } from "../lib/api.ts"

export const createUploadUrl = mutation({
	handler(ctx) {
		return ctx.storage.generateUploadUrl()
	},
})
