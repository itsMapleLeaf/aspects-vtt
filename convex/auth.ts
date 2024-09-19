import Discord from "@auth/core/providers/discord"
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials"
import {
	convexAuth,
	createAccount,
	retrieveAccount,
} from "@convex-dev/auth/server"
import { WithoutSystemFields } from "convex/server"
import { Scrypt } from "lucia"
import { literal, object, parse, pipe, regex, string, union } from "valibot"
import { Doc, Id } from "./_generated/dataModel"

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [
		Discord({
			profile(profile): WithoutSystemFields<Doc<"users">> & { id: string } {
				return {
					id: profile.username,
					handle: profile.username,
					name: profile.global_name,
					email: profile.email,
				}
			},
		}),

		ConvexCredentials({
			id: "credentials",
			async authorize(input, ctx) {
				const accountHandleValidator = pipe(string(), regex(/^[a-z0-9_.]+$/i))

				const credentials = parse(
					union([
						object({
							action: literal("login"),
							handle: accountHandleValidator,
							password: string(),
						}),
						object({
							action: literal("register"),
							handle: accountHandleValidator,
							name: string(),
							// email: optional(string()),
							password: string(),
						}),
					]),
					input,
				)

				let userId: Id<"users">

				if (credentials.action === "login") {
					const { user } = await retrieveAccount(ctx, {
						provider: "credentials",
						account: {
							id: credentials.handle,
							secret: credentials.password,
						},
					})
					userId = user._id
				} else {
					const { user } = await createAccount(ctx, {
						provider: "credentials",
						account: {
							id: credentials.handle,
							secret: credentials.password,
						},
						profile: {
							handle: credentials.handle,
							name: credentials.name,
							// email: credentials.email,
						},
						// shouldLinkViaEmail: credentials.email !== undefined,
					})
					userId = user._id
				}

				return { userId }
			},
			crypto: {
				async hashSecret(password) {
					return await new Scrypt().hash(password)
				},
				async verifySecret(password, hash) {
					return await new Scrypt().verify(hash, password)
				},
			},
		}),
	],
})
