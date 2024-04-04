import { brandedString } from "convex-helpers/validators"
import { v } from "convex/values"
import { omit } from "#app/common/object.js"
import { randomItem } from "#app/common/random.js"
import { Vector } from "#app/common/vector.js"
import { characterNames } from "#app/features/characters/characterNames.ts"
import { CharacterModel } from "./CharacterModel.js"
import { RoomModel } from "./RoomModel.js"
import { mutation, query } from "./_generated/server.js"
import { nullish } from "./helpers.js"

const visibleToValidator = v.union(v.literal("owner"), v.literal("everyone"))

export const characterProperties = {
	// profile
	name: v.optional(v.string()),
	pronouns: v.optional(v.string()),
	imageId: v.optional(v.union(v.id("_storage"), v.null())),
	race: v.optional(v.string()),

	// stats
	damage: v.optional(v.number()),
	fatigue: v.optional(v.number()),
	currency: v.optional(v.number()),

	// attributes
	strength: v.optional(v.number()),
	sense: v.optional(v.number()),
	mobility: v.optional(v.number()),
	intellect: v.optional(v.number()),
	wit: v.optional(v.number()),

	// notes
	ownerNotes: v.optional(v.string()),
	playerNotes: v.optional(v.string()),

	// token properties
	tokenPosition: v.optional(v.object({ x: v.number(), y: v.number() })),

	// visibility
	visibleTo: v.optional(visibleToValidator),
	tokenVisibleTo: v.optional(visibleToValidator),
}

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const { value: room } = await RoomModel.fromId(ctx, args.roomId)
		const models = await room?.getCharacters()
		return await Promise.all(
			models?.map(async (model) => {
				const player = room?.getPlayerByCharacter(model.data._id)
				return {
					...model.data,
					isPlayer: await model.isAssignedToIdentityUser(),
					playerId: player?.userId,
				}
			}) ?? [],
		)
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.roomId).unwrap()
		await room.assertOwned()

		const dice: [number, number, number, number, number] = [4, 6, 8, 12, 20]
		const [strength, sense, mobility, intellect, wit] = dice.sort(() => Math.random() - 0.5)

		return await ctx.db.insert("characters", {
			roomId: args.roomId,
			name: randomItem(characterNames) ?? "Cute Felirian",
			pronouns: randomItem(["he/him", "she/her", "they/them"]),
			strength,
			sense,
			mobility,
			intellect,
			wit,
		})
	},
})

export const duplicate = mutation({
	args: {
		id: v.id("characters"),
	},
	handler: async (ctx, args) => {
		const character = await CharacterModel.get(ctx, args.id).unwrap()
		return await ctx.db.insert("characters", {
			...omit(character.data, ["_id", "_creationTime"]),
			tokenPosition: Vector.from(character.data.tokenPosition ?? Vector.zero).plus(1, 0).xy,
		})
	},
})

export const update = mutation({
	args: {
		...characterProperties,
		id: v.id("characters"),
		playerId: nullish(brandedString("clerkId")),
	},
	handler: async (ctx, { id, playerId, ...args }) => {
		const character = await CharacterModel.get(ctx, id).unwrap()
		await character.update(ctx, args)

		const room = await character.getRoom()
		if (playerId !== undefined && (await room.isOwner())) {
			if (playerId === null) {
				await room.unsetPlayerCharacter(ctx, id)
			} else {
				await room.setPlayerCharacter(ctx, playerId, id)
			}
		}
	},
})

export const remove = mutation({
	args: {
		id: v.id("characters"),
	},
	handler: async (ctx, args) => {
		const character = await CharacterModel.get(ctx, args.id).unwrap()
		await character.delete(ctx)
	},
})
