import { ConvexError, v } from "convex/values"
import { Effect } from "effect"
import { pick } from "../../app/common/object.ts"
import { mutation, query } from "../_generated/server.js"
import { getUserFromClerkId, getUserFromIdentity } from "../auth/helpers.ts"
import { CharacterModel } from "../characters/CharacterModel.js"
import { effectMutation, QueryCtxService } from "../helpers/effect.js"
import { createMessages } from "./helpers.ts"
import { diceInputValidator } from "./types.ts"

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, args) {
		const result = await ctx.db
			.query("messages")
			.withIndex("roomId", (q) => q.eq("roomId", args.roomId))
			.order("desc")
			.take(20)

		return await Promise.all(
			result.map(async ({ userId, ...message }) => {
				const user = await Effect.runPromise(
					getUserFromClerkId(userId).pipe(
						Effect.provideService(QueryCtxService, ctx),
						Effect.tapError(Effect.logWarning),
						Effect.orElseSucceed(() => null),
					),
				)
				const { value: character } = await CharacterModel.fromPlayerId(ctx, userId)
				const data = await character?.getComputedData()
				return {
					...message,
					user: user && {
						...pick(user, ["name", "avatarUrl"]),
						character: data && pick(data, ["displayName", "displayPronouns"]),
					},
				}
			}),
		)
	},
})

export const create = effectMutation({
	args: {
		roomId: v.id("rooms"),
		content: v.optional(v.string()),
		dice: v.optional(v.array(diceInputValidator)),
	},
	handler(args) {
		return createMessages([args]).pipe(
			Effect.map((messages) => messages[0]),
			Effect.flatMap((it) => Effect.orDie(Effect.fromNullable(it))),
		)
	},
})

export const remove = mutation({
	args: {
		id: v.id("messages"),
	},
	async handler(ctx, { id }) {
		const user = await getUserFromIdentity(ctx).getValueOrThrow()

		const message = await ctx.db.get(id)
		if (!message) return

		if (message.userId !== user.clerkId) {
			throw new ConvexError("You don't have permission to do that.")
		}

		await ctx.db.delete(id)
	},
})
