import { literals } from "convex-helpers/validators"
import { v } from "convex/values"
import { Effect } from "effect"
import { random, startCase } from "lodash"
import { typedKeys } from "~/shared/object.ts"
import { getAuthUserId } from "./auth.ts"
import { getAttributeDie, normalizeCharacterAttributes } from "./characters.ts"
import { effectMutation, effectQuery, queryEnt } from "./lib/effects.ts"
import { tableFields } from "./lib/validators.ts"

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

export const createAttributeRollMessage = effectMutation({
	args: {
		characterId: v.id("characters"),
		attribute: literals(
			...typedKeys(tableFields("characters").attributes.fields),
		),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)
			const character = yield* queryEnt(
				ctx.table("characters").get(args.characterId),
			)
			const attributes = normalizeCharacterAttributes(character.attributes)
			const attributeDieFaceCount = getAttributeDie(attributes[args.attribute])

			const results = [
				random(1, attributeDieFaceCount, false),
				random(1, attributeDieFaceCount, false),
			]

			return yield* Effect.promise(() =>
				ctx.table("messages").insert({
					authorId: userId,
					roomId: character.roomId,
					blocks: [
						{
							type: "text",
							text: `${character.name} rolled ${startCase(args.attribute)}`,
						},
						{
							type: "diceRoll",
							rolledDice: results.map((result) => ({
								faces: attributeDieFaceCount,
								result,
							})),
						},
					],
				}),
			)
		}).pipe(Effect.orDie)
	},
})
