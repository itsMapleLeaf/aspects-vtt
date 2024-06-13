import { ConvexError, v } from "convex/values"
import { mutation, query } from "../_generated/server.js"
import { getIdentity } from "../auth/helpers.ts"
import { requireDoc } from "../helpers/convex.ts"
import { diceMacroProperties } from "./types.ts"

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, args) {
		const identity = await getIdentity(ctx).getValueOrNull()
		if (!identity) return []

		return ctx.db
			.query("diceMacros")
			.withIndex("roomId_userId", (q) => q.eq("roomId", args.roomId).eq("userId", identity.subject))
			.collect()
	},
})

export const create = mutation({
	args: diceMacroProperties,
	async handler(ctx, args) {
		const user = await getIdentity(ctx).getValueOrThrow()
		return await ctx.db.insert("diceMacros", {
			...args,
			userId: user.subject,
		})
	},
})

export const remove = mutation({
	args: {
		id: v.id("diceMacros"),
	},
	async handler(ctx, args) {
		const user = await getIdentity(ctx).getValueOrThrow()

		const macro = await requireDoc(ctx, args.id, "diceMacros").getValueOrThrow()
		if (macro.userId !== user.subject) {
			throw new ConvexError("Insufficient permissions")
		}

		await ctx.db.delete(macro._id)
	},
})
