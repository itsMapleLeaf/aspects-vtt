import { v } from "convex/values"
import { random } from "lodash-es"
import { ensureUserId } from "./auth.ts"
import { diceRollInputValidator } from "./dice.ts"
import { mutation, query } from "./lib/ents.ts"

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, args) {
		try {
			await ensureUserId(ctx)
			const messages = await ctx
				.table("messages", "roomId", (q) => q.eq("roomId", args.roomId))
				.order("desc")
				.take(50)

			return await Promise.all(
				messages.map(async (message) => {
					const author = await message.edgeX("author")
					return {
						...message.doc(),
						author: {
							name: author.name,
							image: author.image,
						},
					}
				}),
			)
		} catch (error) {
			return []
		}
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
		content: v.array(
			v.union(
				v.object({
					type: v.literal("text"),
					text: v.string(),
				}),
				v.object({
					type: v.literal("dice"),
					dice: v.array(diceRollInputValidator),
				}),
			),
		),
	},
	async handler(ctx, args) {
		const userId = await ensureUserId(ctx)

		const content = args.content.map((entry) => {
			if (entry.type !== "dice") {
				return entry
			}
			return {
				...entry,
				dice: entry.dice.map((die) => ({
					...die,
					result: random(1, die.faces),
				})),
			}
		})

		await ctx.table("messages").insert({
			roomId: args.roomId,
			authorId: userId,
			content,
		})
	},
})
