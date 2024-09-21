import { getAuthUser } from "../lib/auth.ts"
import { EntQueryCtx, query } from "../lib/ents.ts"

export const me = query({
	handler: async (ctx: EntQueryCtx) => {
		try {
			const user = await getAuthUser(ctx)
			return user.doc()
		} catch {
			return null
		}
	},
})
