import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { expect } from "#app/common/expect.js"
import { range } from "#app/common/range.js"
import { mutation, query } from "./_generated/server.js"
import { getIdentityUser } from "./auth.js"

export const diceRollProperties = {
	roomId: v.id("rooms"),
	label: v.optional(v.string()),
}

export const diceTypeValidator = v.union(
	v.literal("numeric"),
	v.literal("boost"),
	v.literal("snag"),
)

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
		...diceRollProperties,
		dice: v.array(v.object({ name: v.string(), sides: v.number(), count: v.number() })),
	},
	handler: async (ctx, { dice, ...data }) => {
		const user = await getIdentityUser(ctx)

		const rolledDice = dice
			.flatMap((input) => range.array(input.count).map(() => input))
			.map(({ name, sides }) => ({
				key: crypto.randomUUID(),
				name,
				result: (expect(crypto.getRandomValues(new Uint32Array(1))[0], "what") % sides) + 1,
			}))

		return await ctx.db.insert("diceRolls", {
			...data,
			dice: rolledDice,
			rolledBy: user._id,
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
