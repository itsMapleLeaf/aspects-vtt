import Discord from "@auth/core/providers/discord"
import { convexAuth } from "@convex-dev/auth/server"
import { query } from "./_generated/server"

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [Discord],
})

export const me = query({
	handler: async (ctx) => {
		const userId = await auth.getUserId(ctx)
		return userId ? ctx.db.get(userId) : null
	},
})
