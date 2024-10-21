import { getAuthUser } from "./auth.ts"
import { query } from "./lib/ents.ts"

export const me = query({
	async handler(ctx) {
		return await getAuthUser(ctx)
	},
})
