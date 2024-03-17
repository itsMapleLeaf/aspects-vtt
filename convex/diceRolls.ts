import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { roll } from "#app/common/random.js"
import { mutation, query } from "./_generated/server.js"

export const diceRollCreatePayload = {
	roomId: v.id("rooms"),
	rolledBy: v.id("users"),
	label: v.optional(v.string()),
}

export const list = query({
	args: {
		roomId: v.id("rooms"),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		const result = await ctx.db
			.query("diceRolls")
			.withIndex("by_room", (q) => q.eq("roomId", args.roomId))
			.order("desc")
			.paginate(args.paginationOpts)
		return {
			...result,
			page: await Promise.all(
				result.page.map(async (roll) => {
					const rolledBy = await ctx.db.get(roll.rolledBy)
					return {
						...roll,
						rolledBy: rolledBy && {
							name: rolledBy.name,
						},
					}
				}),
			),
		}
	},
})

export const create = mutation({
	args: {
		...diceRollCreatePayload,
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
