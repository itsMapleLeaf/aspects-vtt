import Discord from "@auth/core/providers/discord"
import { Anonymous } from "@convex-dev/auth/providers/Anonymous"
import { convexAuth } from "@convex-dev/auth/server"
import { getOneFrom } from "convex-helpers/server/relationships"
import type { WithoutSystemFields } from "convex/server"
import type { Value } from "convex/values"
import { Effect } from "effect"
import { z } from "zod"
import { omit } from "~/helpers/object.ts"
import { Result } from "../app/helpers/Result.ts"
import { internal } from "./_generated/api"
import type { Doc, Id } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server.js"
import { QueryCtxService } from "./helpers/effect.ts"
import { getCurrentUser } from "./users.ts"

interface Profile extends WithoutSystemFields<Doc<"users">> {
	id: string
}

interface DiscordProfile extends Profile {
	discordId: string
	discordAvatar: string | null
}

interface AnonymousProfile extends Profile {
	isAnonymous: true
}

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [
		Discord({
			async profile(userInput): Promise<DiscordProfile> {
				const user = z
					.object({
						id: z.string(),
						username: z.string(),
						avatar: z.string().nullish(),
						email: z.string().nullish(),
					})
					.parse(userInput)

				return {
					id: user.email ?? user.username,
					name: user.username,
					email: user.email ?? undefined,
					discordId: user.id,
					discordAvatar: user.avatar ?? null,
				}
			},
		}),

		Anonymous({
			id: "test",
			profile(params): AnonymousProfile & { [key: string]: Value } {
				if (process.env.TEST !== "true") {
					throw new Error("Anonymous users are only allowed in test mode")
				}
				const id = z.string().parse(params.id)
				return {
					id,
					name: id,
					isAnonymous: true,
				}
			},
		}),
	],

	callbacks: {
		async createOrUpdateUser(ctx: MutationCtx, argsInput) {
			const argsType = z.union([
				z.object({
					// transforming to a top-level property so the profile union type can be discriminated
					provider: z.object({ id: z.literal("discord") }).transform((it) => it.id),
					existingUserId: z.custom<Id<"users">>((it) => typeof it === "string").nullish(),
					profile: z.object({
						name: z.string(),
						email: z.string(),
						discordId: z.string(),
						discordAvatar: z.string().nullish(),
					}),
				}),
				z.object({
					provider: z.object({ id: z.literal("test") }).transform((it) => it.id),
					existingUserId: z.custom<Id<"users">>((it) => typeof it === "string").nullish(),
					profile: z.object({
						name: z.string(),
						isAnonymous: z.literal(true),
					}),
				}),
			])
			const args = argsType.parse(argsInput)

			switch (args.provider) {
				case "discord": {
					let userId: Id<"users"> | undefined

					if (args.existingUserId) {
						await ctx.db.patch(
							args.existingUserId,
							omit(args.profile, ["discordId", "discordAvatar"]),
						)
						userId = args.existingUserId
					}

					if (!userId && args.profile.email) {
						const existingWithEmail = await getOneFrom(
							ctx.db,
							"users",
							"email",
							args.profile.email,
							"email",
						)
						if (typeof existingWithEmail?._id === "string") {
							userId = existingWithEmail._id
						}
					}

					if (!userId) {
						userId = await ctx.db.insert(
							"users",
							omit(args.profile, ["discordId", "discordAvatar"]),
						)
					}

					if (args.profile.discordAvatar) {
						await ctx.scheduler.runAfter(0, internal.images_node.setUserImageFromDiscord, {
							userId,
							name: args.profile.name,
							discordUserId: args.profile.discordId,
							discordImageSnowflake: args.profile.discordAvatar,
						})
					}

					return userId
				}

				case "test": {
					if (args.existingUserId) {
						return args.existingUserId
					}
					return await ctx.db.insert("users", args.profile)
				}
			}
		},
	},
})

/** @deprecated Use {@link getCurrentUser} instead */
export function getUserFromIdentity(ctx: QueryCtx) {
	return Result.fn(async () => {
		return await getCurrentUser().pipe(
			Effect.provideService(QueryCtxService, ctx),
			Effect.runPromise,
		)
	})
}

/** @deprecated Use {@link getCurrentUser} instead */
export function getUserFromIdentityEffect() {
	return getCurrentUser()
}

export class UnauthorizedError {
	readonly _tag = "UnauthorizedError"
}
