import { ensureUser } from "../lib/auth.ts"
import { query } from "../lib/ents.ts"

export const me = query({
	async handler(ctx) {
		return ensureUser(ctx)({
			onAuthorized: (userId) => ctx.table("users").get(userId)?.doc(),
			onUnauthorized: () => null,
		})
	},
})
