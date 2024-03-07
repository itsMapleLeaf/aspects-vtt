import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { roll } from "~/common/random.js"
import { mutation, query } from "./_generated/server.js"

export const createPayload = {
	roomSlug: v.string(),
	author: v.string(),
	label: v.optional(v.string()),
}

export const list = query({
	args: {
		roomSlug: v.string(),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("diceRolls")
			.withIndex("by_room", (q) => q.eq("roomSlug", args.roomSlug))
			.order("desc")
			.paginate(args.paginationOpts)
	},
})

export const create = mutation({
	args: {
		...createPayload,
		dice: v.array(v.object({ sides: v.number() })),
	},
	handler: async (ctx, { dice, ...data }) => {
		const rolledDice = dice.map((die) => ({
			key: crypto.randomUUID(),
			sides: die.sides,
			outcome: roll(die.sides),
		}))
		return await ctx.db.insert("diceRolls", {
			...data,
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
