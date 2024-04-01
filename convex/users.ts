import { internalMutation } from "./_generated/server"
import type { Branded } from "./helpers.ts"

export const migrateUserIdsToClerkIds = internalMutation({
	async handler(ctx, args) {
		for await (const user of ctx.db.query("users")) {
			const userId = user._id as string as Branded<"clerkId">

			for await (const room of ctx.db
				.query("rooms")
				.withIndex("by_owner", (q) => q.eq("ownerId", userId))) {
				await ctx.db.patch(room._id, {
					ownerId: user.clerkId,
					players: room.players.map((player) => ({
						...player,
						userId: player.userId === userId ? user.clerkId : player.userId,
					})),
				})
			}

			for await (const message of ctx.db
				.query("messages")
				.filter((q) => q.eq(q.field("userId"), userId))) {
				await ctx.db.patch(message._id, { userId: user.clerkId })
			}
		}
	},
})
