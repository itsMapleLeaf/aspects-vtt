import { random, startCase } from "lodash"
import {
	getAttributeDie,
	normalizeCharacterAttributes,
} from "~/features/characters/helpers.ts"
import { protectedMutationHandler, protectedQueryHandler } from "../lib/auth.ts"

export const list = protectedQueryHandler(
	[],
	async (ctx, userId, { roomId }) => {
		return await ctx
			.table("messages", "roomId", (q) => q.eq("roomId", roomId))
			.order("desc")
			.take(50)
			.map(async (message) => ({
				...message.doc(),
				author: await message.edge("author").then((user) => ({
					name: user.name,
					image: user.image,
				})),
			}))
	},
)

export const createAttributeRollMessage = protectedMutationHandler(
	async (ctx, userId, { characterId, attribute }) => {
		const character = await ctx.table("characters").getX(characterId)
		const attributes = normalizeCharacterAttributes(character.attributes)
		const attributeDieFaceCount = getAttributeDie(attributes[attribute])

		const results = [
			random(1, attributeDieFaceCount, false),
			random(1, attributeDieFaceCount, false),
		]

		return await ctx.table("messages").insert({
			authorId: ctx.userId,
			roomId: character.roomId,
			blocks: [
				{
					type: "text",
					text: `${character.name} rolled ${startCase(attribute)}`,
				},
				{
					type: "diceRoll",
					rolledDice: results.map((result) => ({
						faces: attributeDieFaceCount,
						result,
					})),
				},
			],
		})
	},
)
