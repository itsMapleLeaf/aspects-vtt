import { v } from "convex/values"
import { UserModel } from "./UserModel.js"
import { type QueryCtx, mutation, query } from "./_generated/server.js"
import { withResultResponse } from "./resultResponse.js"

export const user = query({
	handler: withResultResponse(async (ctx: QueryCtx) => {
		const user = await UserModel.fromIdentity(ctx)
		return user.data
	}),
})

export const setup = mutation({
	args: {
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	},
	async handler(ctx, args) {
		const user = await UserModel.fromIdentity(ctx)
		await user.update(ctx, args)
	},
})
