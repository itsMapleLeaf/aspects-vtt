import Discord from "@auth/core/providers/discord"
import { convexAuth } from "@convex-dev/auth/server"
import type { WithoutSystemFields } from "convex/server"
import { Effect } from "effect"
import { Result } from "../app/helpers/Result.ts"
import { internal } from "./_generated/api.js"
import type { Doc } from "./_generated/dataModel"
import type { QueryCtx } from "./_generated/server.js"
import { QueryCtxService } from "./helpers/effect.ts"
import { getCurrentUser } from "./users.ts"

interface DiscordUser {
	id: string
	username: string
	avatar: string | null
	email: string | null
}

type Profile = WithoutSystemFields<Doc<"users">> & {
	id: string
	discordId: string
	discordAvatar: string | null
}

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [
		Discord({
			async profile(user: DiscordUser): Promise<Profile> {
				return {
					id: user.email ?? user.username,
					name: user.username,
					email: user.email ?? undefined,
					discordId: user.id,
					discordAvatar: user.avatar,
				}
			},
		}),
	],
	callbacks: {
		async createOrUpdateUser(ctx, args) {
			const { discordId, discordAvatar, ...profile } = args.profile as Profile
			let userId

			if (args.existingUserId) {
				await ctx.db.patch(args.existingUserId, profile)
				userId = args.existingUserId
			} else {
				const existingWithEmail = await ctx.db
					.query("users")
					// @ts-expect-error
					.withIndex("email", (q) => q.eq("email", profile.email))
					.first()

				if (existingWithEmail) {
					userId = existingWithEmail._id
				}
			}

			if (args.provider.id === "discord" && discordAvatar) {
				await ctx.scheduler.runAfter(0, internal.images_node.setUserImageFromDiscord, {
					userId,
					name: profile.name,
					discordUserId: discordId,
					discordImageSnowflake: discordAvatar,
				})
			}

			return userId
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
