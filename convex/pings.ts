import { v } from "convex/values"
import { internal } from "./_generated/api"
import { ensureUserId } from "./auth.ts"
import { internalMutation, mutation, query } from "./lib/ents.ts"
import { vectorValidator } from "./schema"

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
		position: vectorValidator,
		key: v.string(),
	},
	async handler(ctx, args) {
		const userId = await ensureUserId(ctx)

		const pingId = await ctx.table("pings").insert({
			...args,
			userId,
		})

		await ctx.scheduler.runAfter(3_000, internal.pings.remove, { pingId })

		return pingId
	},
})

export const remove = internalMutation({
	args: { pingId: v.id("pings") },
	async handler(ctx, args) {
		await ctx.table("pings").getX(args.pingId).delete()
	},
})

export const list = query({
	args: { roomId: v.id("rooms") },
	async handler(ctx, args) {
		const pings = await ctx.table("pings", "roomId", (q) =>
			q.eq("roomId", args.roomId),
		)

		const pingsWithUserInfo = await Promise.all(
			pings.map(async (ping) => {
				const user = await ping.edgeX("user")
				return {
					...ping.doc(),
					user: {
						_id: user._id,
						name: user.name,
					},
				}
			}),
		)

		return pingsWithUserInfo
	},
})
