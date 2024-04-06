import { paginationOptsValidator } from "convex/server"
import { ConvexError, v } from "convex/values"
import { expect } from "#app/common/expect.js"
import { pick } from "#app/common/object.js"
import { range } from "#app/common/range.js"
import { CharacterModel } from "./CharacterModel.js"
import { UserModel } from "./UserModel.js"
import { internalMutation, mutation, query } from "./_generated/server.js"

export const migrateDiceRolls = internalMutation({
	async handler(ctx, args) {
		for await (const roll of ctx.db.query("diceRolls")) {
			await ctx.db.insert("messages", {
				roomId: roll.roomId,
				userId: roll.rolledBy,
				content: roll.label,
				diceRoll: {
					dice: roll.dice,
				},
			})
		}
	},
})

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
					const user = await UserModel.fromClerkId(ctx, userId)
					const { value: character } = await CharacterModel.fromPlayerId(ctx, userId)
					const data = await character?.getComputedData()
					return {
						...message,
						user: user && {
							...pick(user.data, ["name", "avatarUrl"]),
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
		const user = await UserModel.fromIdentity(ctx)

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
			userId: user.data.clerkId,
			diceRoll: diceRolls.length > 0 ? { dice: diceRolls } : undefined,
		})
	},
})

export const remove = mutation({
	args: {
		id: v.id("messages"),
	},
	async handler(ctx, { id }) {
		const user = await UserModel.fromIdentity(ctx)

		const message = await ctx.db.get(id)
		if (!message) return

		if (message.userId !== user.data.clerkId) {
			throw new ConvexError("You don't have permission to do that.")
		}

		await ctx.db.delete(id)
	},
})
