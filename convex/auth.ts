import Discord from "@auth/core/providers/discord"
import { Password } from "@convex-dev/auth/providers/Password"
import { convexAuth } from "@convex-dev/auth/server"

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [
		Discord,
		Password({
			profile(params) {
				return {
					name: params.name as string,
					email: params.email as string,
				}
			},
		}),
	],
})
