import { getAuthUserId } from "@convex-dev/auth/server"
import { literals } from "convex-helpers/validators"
import { v } from "convex/values"
import { random, startCase } from "lodash-es"
import type { Doc } from "../_generated/dataModel"
import { mutation, query } from "../lib/ents.ts"
import schema from "../schema.ts"
import { getAttributeDie, normalizeCharacterAttributes } from "./characters.ts"

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, { roomId }) => {
		return await ctx
			.table("messages", "roomId", (q) => q.eq("roomId", roomId))
			.map(async (message) => ({
				...message.doc(),
				author: await message.edge("author").then((user) => ({
					name: user.name,
					image: user.image,
				})),
			}))
	},
})

export const createAttributeRollMessage = mutation({
	args: {
		characterId: v.id("characters"),
		attribute: literals(
			...(Object.keys(
				schema.tables.characters.validator.fields.attributes.fields,
			) as (keyof NonNullable<Doc<"characters">["attributes"]>)[]),
		),
	},
	handler: async (ctx, { characterId, attribute }) => {
		const character = await ctx.table("characters").getX(characterId)

		const roomOwner = await character.edgeX("room").edgeX("owner")

		const userId =
			(await getAuthUserId(ctx)) ??
			(await character
				.edgeX("room")
				.edgeX("owner")
				.then((ent) => ent._id))

		// TODO
		// if (!userId) {
		// 	throw new ConvexError("Unauthorized")
		// }

		const attributes = normalizeCharacterAttributes(character.attributes)

		const attributeDieFaceCount = getAttributeDie(attributes[attribute])

		const results = [
			random(1, attributeDieFaceCount, false),
			random(1, attributeDieFaceCount, false),
		]

		return await ctx.table("messages").insert({
			authorId: userId!,
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
})
