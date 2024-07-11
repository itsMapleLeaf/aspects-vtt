import Discord from "@auth/core/providers/discord"
import { convexAuth } from "@convex-dev/auth/server"
import { getSecret } from "./secrets.ts"

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [
		Discord({
			clientId: getSecret("DISCORD_CLIENT_ID"),
			clientSecret: getSecret("DISCORD_CLIENT_SECRET"),
		}),
	],
})
