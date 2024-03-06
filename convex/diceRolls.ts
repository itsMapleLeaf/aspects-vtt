import { v } from "convex/values"
import { roll } from "~/common/random.js"
import { mutation, query } from "./_generated/server.js"

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const items = await ctx.db
			.query("diceRolls")
			.withIndex("by_room", (q) => q.eq("roomId", args.roomId))
			.order("desc")
			.take(100)
		return items.toReversed()
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
		author: v.string(),
		dice: v.array(v.object({ sides: v.number() })),
	},
	handler: async (ctx, args) => {
		const rolledDice = args.dice.map((die) => ({
			...die,
			outcome: roll(die.sides),
		}))
		return await ctx.db.insert("diceRolls", {
			roomId: args.roomId,
			author: args.author,
			dice: rolledDice,
		})
	},
})

export const remove = mutation({
	args: {
		id: v.id("diceRolls"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id)
	},
})
