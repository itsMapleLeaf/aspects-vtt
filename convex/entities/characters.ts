import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { clamp } from "lodash-es"
import { DEFAULT_WEALTH_TIER } from "~/features/characters/constants.ts"
import { Doc } from "../_generated/dataModel"
import { EntMutationCtx, EntQueryCtx, mutation, query } from "../lib/ents.ts"
import schema from "../schema.ts"

export const get = query({
	args: {
		characterId: v.id("characters"),
	},
	handler: async (ctx: EntQueryCtx, args) => {
		const character = await ctx.table("characters").get(args.characterId)
		return character ? normalizeCharacter(ctx, character) : null
	},
})

export const list = query({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	handler: async (ctx: EntQueryCtx, { roomId, search }) => {
		let characters
		if (search) {
			characters = ctx
				.table("characters")
				.search("name", (q) => q.search("name", search))
		} else {
			characters = ctx.table("characters", "roomId", (q) =>
				q.eq("roomId", roomId),
			)
		}
		return characters.map((char) => normalizeCharacter(ctx, char))
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx: EntMutationCtx, args) => {
		return ctx.table("characters").insert({
			name: "New Character",
			roomId: args.roomId,
			updatedAt: Date.now(),
		})
	},
})

export const update = mutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		characterId: v.id("characters"),
	},
	handler: async (ctx: EntMutationCtx, { characterId, ...args }) => {
		return ctx.table("characters").getX(characterId).patch(args)
	},
})

export const remove = mutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	handler: async (ctx: EntMutationCtx, args) => {
		for (const characterId of args.characterIds) {
			await ctx.table("characters").getX(characterId).delete()
		}
	},
})

export const duplicate = mutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	handler: async (ctx: EntMutationCtx, args) => {
		for (const characterId of args.characterIds) {
			const character = await ctx.table("characters").get(characterId)
			if (character) {
				const { _id, _creationTime, ...characterData } = character
				await ctx.table("characters").insert(characterData)
			}
		}
	},
})

export async function normalizeCharacter(
	ctx: EntQueryCtx,
	doc: Doc<"characters">,
) {
	const imageUrl = doc.imageId ? await ctx.storage.getUrl(doc.imageId) : null

	const attributes = normalizeCharacterAttributes(doc.attributes)

	const healthMax =
		getAttributeDie(attributes.strength) + getAttributeDie(attributes.mobility)
	const resolveMax = attributes.sense + attributes.intellect + attributes.wit

	const normalized = {
		...doc,

		attributes,

		imageUrl,

		health: doc.health ?? healthMax,
		healthMax,

		resolve: doc.resolve ?? resolveMax,
		resolveMax,

		wealth: doc.wealth ?? DEFAULT_WEALTH_TIER,

		battlemapPosition: doc.battlemapPosition ?? { x: 0, y: 0 },
	}
	return normalized satisfies Doc<"characters">
}

export function normalizeCharacterAttributes(
	attributes: Doc<"characters">["attributes"],
) {
	return {
		strength: normalizeAttribute(attributes?.strength),
		sense: normalizeAttribute(attributes?.sense),
		mobility: normalizeAttribute(attributes?.mobility),
		intellect: normalizeAttribute(attributes?.intellect),
		wit: normalizeAttribute(attributes?.wit),
	}
}

function normalizeAttribute(attribute: number | undefined): number {
	return clamp(attribute ?? 1, 1, 5)
}

export function getAttributeDie(attribute: number) {
	return [4, 6, 8, 10, 12][normalizeAttribute(attribute) - 1] as number
}
