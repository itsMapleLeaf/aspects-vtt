import { paginationOptsValidator } from "convex/server"
import { ConvexError, v } from "convex/values"
import { expect } from "#app/common/expect.js"
import { pick } from "#app/common/object.js"
import { range } from "#app/common/range.js"
import { CharacterModel } from "./CharacterModel.js"
import { mutation, query } from "./_generated/server.js"
import { getUserFromClerkId, getUserFromIdentity } from "./users.js"

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
					const user = await getUserFromClerkId(ctx, userId).getValueOrNull()
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
			),
		}
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
		content: v.optional(v.string()),
		dice: v.optional(v.array(v.object({ name: v.string(), sides: v.number(), count: v.number() }))),
	},
	async handler(ctx, { dice = [], content = "", ...args }) {
		const user = await getUserFromIdentity(ctx).getValueOrThrow()

		const diceRolls = dice
			.flatMap((input) => range.array(input.count).map(() => input))
			.map(({ name, sides }) => ({
				key: crypto.randomUUID(),
				name,
				result: (expect(crypto.getRandomValues(new Uint32Array(1))[0], "what") % sides) + 1,
			}))

		if (content.trim() === "" && diceRolls.length === 0) {
			throw new ConvexError("Message cannot be empty.")
		}

		return await ctx.db.insert("messages", {
			...args,
			content,
			userId: user.clerkId,
			diceRoll: diceRolls.length > 0 ? { dice: diceRolls } : undefined,
		})
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
