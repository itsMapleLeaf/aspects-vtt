import { query } from "./_generated/server.js"

export const list = query({
	args: {},
	handler: async (ctx) => {
		// Grab the most recent messages.
		const messages = await ctx.db.query("messages").order("desc").take(100)
		// Reverse the list so that it's in a chronological order.
		return messages.reverse()
	},
})
