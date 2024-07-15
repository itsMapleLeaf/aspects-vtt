// @ts-nocheck
import { internalMutation } from "./_generated/server.js"

export const clerkIdsToUserIds = internalMutation({
	async handler(ctx) {
		for await (const room of ctx.db.query("rooms")) {
			const user = await ctx.db
				.query("users")
				.filter((q) => q.eq(q.field("clerkId"), room.ownerId))
				.first()

			if (user) {
				await ctx.db.patch(room._id, { owner: user._id })
			}
		}

		for await (const player of ctx.db.query("players")) {
			const user = await ctx.db
				.query("users")
				.filter((q) => q.eq(q.field("clerkId"), player.userId))
				.first()

			if (user) {
				await ctx.db.patch(player._id, { user: user._id })
			}
		}

		for await (const messages of ctx.db.query("messages")) {
			const user = await ctx.db
				.query("users")
				.filter((q) => q.eq(q.field("clerkId"), messages.userId))
				.first()

			if (user) {
				await ctx.db.patch(messages._id, { user: user._id })
			}
		}

		for await (const characters of ctx.db.query("characters")) {
			const user = await ctx.db
				.query("users")
				.filter((q) => q.eq(q.field("clerkId"), characters.playerId))
				.first()

			if (user) {
				await ctx.db.patch(characters._id, { player: user._id })
			}
		}

		for await (const diceMacros of ctx.db.query("diceMacros")) {
			const user = await ctx.db
				.query("users")
				.filter((q) => q.eq(q.field("clerkId"), diceMacros.userId))
				.first()

			if (user) {
				await ctx.db.patch(diceMacros._id, { user: user._id })
			}
		}
	},
})
