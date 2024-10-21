import Discord from "@auth/core/providers/discord"
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials"
import { Password } from "@convex-dev/auth/providers/Password"
import {
	convexAuth,
	createAccount,
	getAuthUserId,
	retrieveAccount,
} from "@convex-dev/auth/server"
import type { Auth } from "convex/server"
import { WithoutSystemFields } from "convex/server"
import { ConvexError } from "convex/values"
import { parse } from "valibot"
import { ensureSomething } from "~/shared/errors.ts"
import { credentialsPayloadValidator } from "../shared/auth/validators.ts"
import { Doc, Id } from "./_generated/dataModel"
import type { EntQueryCtx } from "./lib/ents.ts"

export { getAuthUserId } from "@convex-dev/auth/server"

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [
		Discord({
			profile(profile): WithoutSystemFields<Doc<"users">> & { id: string } {
				return {
					id: profile.username,
					name: profile.username,
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

export class UnauthenticatedError extends ConvexError<string> {
	constructor() {
		super("You must be logged in to perform this action.")
	}
}

export class InaccessibleError extends ConvexError<string> {
	constructor(details: { id?: string; table?: string }) {
		super(
			[
				"Operation failed: either the requested entity does not exist, or you do not have access to it.",
				`ID: ${details.id}`,
				`Collection: ${details.table}`,
			].join("\n"),
		)
	}
}

export async function getAuthUser(ctx: EntQueryCtx) {
	const userId = await getAuthUserId(ctx)
	return userId && (await ctx.table("users").get(userId))
}

export async function ensureUserId(ctx: { auth: Auth }) {
	return ensureSomething(
		await getAuthUserId(ctx),
		new ConvexError("Not logged in"),
	)
}
