import { getAuthUser } from "./auth.new.ts"
import { query } from "./lib/ents.ts"

export const me = query({
	async handler(ctx) {
		return await getAuthUser(ctx)
	},
})
