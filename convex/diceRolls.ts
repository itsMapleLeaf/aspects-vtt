import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { roll } from "#app/common/random.js"
import { range } from "#app/common/range.js"
import { diceKindsByName } from "#app/features/dice/diceKinds.js"
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
		dice: v.array(v.object({ name: v.string(), count: v.number() })),
	},
	handler: async (ctx, { dice, ...data }) => {
		const user = await getIdentityUser(ctx)

		function* rollDice() {
			for (const [index, { name, count }] of dice.entries()) {
				const kind = diceKindsByName.get(name)
				if (!kind) {
					console.error(`Unknown dice type "${name}" at index ${index}`)
					continue
				}
				for (const _ of range(count)) {
					yield {
						key: crypto.randomUUID(),
						name: kind.name,
						result: roll(kind.faces.length),
					}
				}
			}
		}

		return await ctx.db.insert("diceRolls", {
			...data,
			dice: [...rollDice()],
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
