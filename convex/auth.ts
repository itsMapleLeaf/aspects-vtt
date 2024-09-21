import Discord from "@auth/core/providers/discord"
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials"
import { Password } from "@convex-dev/auth/providers/Password"
import {
	convexAuth,
	createAccount,
	retrieveAccount,
} from "@convex-dev/auth/server"
import { WithoutSystemFields } from "convex/server"
import { ConvexError } from "convex/values"
import { parse } from "valibot"
import { credentialsPayloadValidator } from "../shared/auth/validators"
import { Doc, Id } from "./_generated/dataModel"

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [
		Discord({
			profile(profile): WithoutSystemFields<Doc<"users">> & { id: string } {
				return {
					id: profile.username,
					email: profile.email,
				}
			},
		}),

		ConvexCredentials({
			id: "credentials",
			async authorize(rawInput, ctx) {
				const input = parse(credentialsPayloadValidator, rawInput)

				let userId: Id<"users">

				if (input.action === "login") {
					try {
						const result = await retrieveAccount(ctx, {
							provider: "credentials",
							account: {
								id: input.username,
								secret: input.password,
							},
						})
						userId = result.user._id
					} catch (error) {
						throw new ConvexError("Invalid username or password")
					}
				} else {
					const { user } = await createAccount(ctx, {
						provider: "credentials",
						account: {
							id: input.username,
							secret: input.password,
						},
						profile: {
							name: input.username,
						},
					})
					userId = user._id
				}

				return { userId }
			},
			// @ts-expect-error: convex team are mean :(
			crypto: Password().options.crypto,
		}),
	],
})
