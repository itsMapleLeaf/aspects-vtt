import { ConvexError, v } from "convex/values"
import { EntMutationCtx, mutation } from "../lib/ents.ts"

export const deleteUser = mutation({
	args: {
		handle: v.string(),
	},
	handler: async (ctx: EntMutationCtx, { handle }) => {
		if (process.env.TEST !== "true") {
			throw new ConvexError("Not in testing environment")
		}

		const user = await ctx.table("users").getX("handle", handle)
		await ctx.table("users").getX(user._id).delete()
	},
})

export const deleteRoom = mutation({
	args: {
		slug: v.string(),
	},
	handler: async (ctx: EntMutationCtx, { slug }) => {
		if (process.env.TEST !== "true") {
			throw new ConvexError("Not in testing environment")
		}

		const room = await ctx.table("rooms").getX("slug", slug)
		await ctx.table("rooms").getX(room._id).delete()
	},
})

export const clearScenes = mutation({
	handler: async (ctx: EntMutationCtx) => {
		if (process.env.TEST !== "true") {
			throw new ConvexError("Not in testing environment")
		}

		const room = await ctx.table("rooms").getX("slug", "testroom")
		await ctx
			.table("scenes", "roomId", (q) => q.eq("roomId", room._id))
			.map((ent) => ent.delete())
	},
})
