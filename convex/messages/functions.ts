import { paginationOptsValidator } from "convex/server"
import { ConvexError, v } from "convex/values"
import { Effect } from "effect"
import { Iterator } from "iterator-helpers-polyfill"
import { pick } from "../../app/common/object.ts"
import { getUserFromClerkId, getUserFromIdentity } from "../auth/helpers.ts"
import { CharacterModel } from "../characters/CharacterModel.js"
import { createDiceRolls } from "../dice/helpers.ts"
import { QueryCtxService } from "../helpers/effect.js"
import { mutation, query } from "../helpers/ents.ts"
import { diceInputValidator } from "./types.ts"

export const list = query({
	args: {
		roomId: v.id("rooms"),
		paginationOpts: paginationOptsValidator,
	},
	async handler(ctx, args) {
		const result = await ctx.db
			.query("messages")
			.withIndex("by_room", (q) => q.eq("roomId", args.roomId))
			.order("desc")
			.paginate(args.paginationOpts)

		return {
			...result,
			page: await Promise.all(
				result.page.map(async ({ userId, ...message }) => {
					const user = await Effect.runPromise(
						getUserFromClerkId(userId).pipe(
							Effect.provideService(QueryCtxService, ctx),
							Effect.tapError(Effect.logWarning),
							Effect.orElseSucceed(() => null),
						),
					)
					const { value: character } = await CharacterModel.fromPlayerId(
						ctx,
						userId,
					)
					const data = await character?.getComputedData()
					return {
						...message,
						user: user && {
							...pick(user, ["name", "avatarUrl"]),
							character: data && pick(data, ["displayName", "displayPronouns"]),
						},
					}
				}),
			),
		}
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
		content: v.optional(v.string()),
		dice: v.optional(v.array(diceInputValidator)),
	},
	async handler(ctx, { dice = [], content = "", ...args }) {
		const user = await getUserFromIdentity(ctx).getValueOrThrow()
		const diceInputCount = dice.reduce((total, input) => total + input.count, 0)

		if (content.trim() === "" && diceInputCount === 0) {
			throw new ConvexError("Message cannot be empty.")
		}

		const diceRolls = Iterator.from(createDiceRolls(dice)).toArray()

		const message = {
			...args,
			content,
			userId: user.clerkId,
			diceRoll: diceRolls.length > 0 ? { dice: diceRolls } : undefined,
		}
		await ctx.db.insert("messages", message)
		return message
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
