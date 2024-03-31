import { internalMutation } from "./_generated/server"

export const migrateUserIdsToClerkIds = internalMutation({
	async handler(ctx, args) {
		for await (const user of ctx.db.query("users")) {
			for await (const room of ctx.db
				.query("rooms")
				.withIndex("by_owner", (q) => q.eq("ownerId", user._id))) {
				await ctx.db.patch(room._id, {
					ownerId: user.clerkId,
					players: room.players.map((player) => ({
						...player,
						userId: player.userId === user._id ? user.clerkId : player.userId,
					})),
				})
			}

			for await (const message of ctx.db
				.query("messages")
				.filter((q) => q.eq(q.field("userId"), user._id))) {
				await ctx.db.patch(message._id, { userId: user.clerkId })
			}
		}
	},
})
