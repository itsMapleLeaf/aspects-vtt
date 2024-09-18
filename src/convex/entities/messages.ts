import { v } from "convex/values"
import { query } from "../lib/ents.ts"

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, { roomId }) => {
		const author = await ctx.table("users").firstX()
		return [
			{
				_id: "1",
				_creationTime: Date.now() - 60_000,
				authorId: author._id,
				author,
				blocks: [
					{
						type: "text" as const,
						text: "Welcome to Rosenfeld.",
					},
				],
			},
			{
				_id: "2",
				_creationTime: Date.now() - 30_000,
				authorId: author._id,
				author,
				blocks: [
					{
						type: "text" as const,
						text: "Luna attacked Priya for 2 damage.",
					},
					{
						type: "diceRoll" as const,
						rolledDice: [
							{ faces: 4, result: 3 },
							{ faces: 6, result: 2 },
							{ faces: 8, result: 1 },
							{ faces: 10, result: 5 },
							{ faces: 12, result: 7 },
							{ faces: 100, result: 25 },
							{ faces: 6, result: 5, color: "green" },
							{
								faces: 6,
								result: 1,
								color: "red",
								operation: "subtract" as const,
							},
						],
					},
					{
						type: "diceRoll" as const,
						rolledDice: [
							{ faces: 6, result: 6 },
							{ faces: 6, result: 2 },
						],
					},
				],
			},
		]
	},
})
