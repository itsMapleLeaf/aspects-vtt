import { v } from "convex/values"
import { Effect } from "effect"
import { random } from "lodash"
import { getAuthUserId } from "./auth.ts"
import { effectMutation, effectQuery, queryEnt } from "./lib/effects.ts"
import { diceRollInputValidator } from "./validators/dice.ts"

export const list = effectQuery({
	args: {
		roomId: v.id("rooms"),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			yield* getAuthUserId(ctx)
			const messages = yield* Effect.promise(() =>
				ctx
					.table("messages", "roomId", (q) => q.eq("roomId", args.roomId))
					.order("desc")
					.take(50),
			)
			return yield* Effect.forEach(messages, (message) =>
				Effect.gen(function* () {
					const author = yield* queryEnt(message.edge("author"))
					return {
						...message.doc(),
						author: {
							name: author.name,
							image: author.image,
						},
					}
				}),
			)
		}).pipe(Effect.orElseSucceed(() => []))
	},
})

export const create = effectMutation({
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
	handler(ctx, args) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)

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

			yield* Effect.promise(() =>
				ctx.table("messages").insert({
					roomId: args.roomId,
					authorId: userId,
					content,
				}),
			)
		}).pipe(Effect.orDie)
	},
})
