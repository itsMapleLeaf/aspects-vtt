import { ConvexError, type Infer, v } from "convex/values"
import { raise } from "#app/common/errors.js"
import { clamp } from "#app/common/math.js"
import { omit, pick } from "#app/common/object.js"
import { randomInt, randomItem } from "#app/common/random.js"
import { characterNames } from "#app/features/characters/characterNames.ts"
import { mutation, query } from "./_generated/server.js"
import { nullish } from "./helpers.js"
import { withResultResponse } from "./resultResponse.js"
import { getRoomContext, getRoomOwnerOnlyContext, getRoomPlayerContext } from "./rooms.js"
import { replaceFile } from "./storage.js"

const visibleToValidator = v.union(v.literal("owner"), v.literal("everyone"))

const roomOwnerProperties = {
	visibleTo: v.optional(visibleToValidator),
	ownerNotes: v.optional(v.string()),
}

const playerProperties = {
	imageId: v.optional(v.union(v.id("_storage"), v.null())),

	name: v.optional(v.string()),
	pronouns: v.optional(v.string()),
	damage: v.optional(v.number()),
	fatigue: v.optional(v.number()),
	currency: v.optional(v.number()),

	strength: v.optional(v.number()),
	sense: v.optional(v.number()),
	mobility: v.optional(v.number()),
	intellect: v.optional(v.number()),
	wit: v.optional(v.number()),

	playerNotes: v.optional(v.string()),
}

const tokenProperties = {
	tokenPosition: v.optional(v.object({ x: v.number(), y: v.number() })),
	tokenVisibleTo: v.optional(visibleToValidator),
}

export const characterProperties = {
	...roomOwnerProperties,
	...playerProperties,
	...tokenProperties,
}

const characterValidator = v.object(characterProperties)

const defaultProperties: Required<Infer<typeof characterValidator>> = {
	imageId: null,
	name: "",
	pronouns: "",
	damage: 0,
	fatigue: 0,
	currency: 0,
	strength: 4,
	sense: 4,
	mobility: 4,
	intellect: 4,
	wit: 4,

	playerNotes: "",
	ownerNotes: "",

	visibleTo: "owner",

	tokenPosition: { x: 0, y: 0 },
	tokenVisibleTo: "owner",
}

const keys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[]

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: withResultResponse(async (ctx, args) => {
		const { room, isOwner, player } = await getRoomContext(ctx, args.roomId)
		const playersByCharacterId = new Map(room.players.map((player) => [player.characterId, player]))

		let query = ctx.db.query("characters").withIndex("by_room", (q) => q.eq("roomId", args.roomId))

		if (!isOwner) {
			query = query.filter((q) =>
				q.or(q.eq(q.field("visibleTo"), "everyone"), q.eq(q.field("_id"), player?.characterId)),
			)
		}

		const characters = await query.collect().then((characters) =>
			characters.map((character) => ({
				...defaultProperties,
				...character,
				playerId: playersByCharacterId.get(character._id)?.userId ?? null,
			})),
		)

		if (isOwner) {
			return characters
		}

		const playerPropertyKeys = keys(playerProperties)

		return characters
			.map((character) => ({
				...defaultProperties,
				_id: character._id,
				playerId: null,
				...((character.visibleTo === "everyone" || character._id === player?.characterId) &&
					pick(character, playerPropertyKeys)),
			}))
			.filter(Boolean)
	}),
})

export const listTokens = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: withResultResponse(async (ctx, args) => {
		const { isOwner, player } = await getRoomContext(ctx, args.roomId)

		let query = ctx.db.query("characters").withIndex("by_room", (q) => q.eq("roomId", args.roomId))

		if (!isOwner) {
			query = query.filter((q) =>
				q.or(
					q.eq(q.field("tokenVisibleTo"), "everyone"),
					q.eq(q.field("_id"), player?.characterId),
				),
			)
		}

		const characters = await query.collect()

		return characters
			.map((character) => ({ ...defaultProperties, ...character }))
			.map((character) => ({
				...pick(character, ["_id", "name", "imageId", "tokenPosition", "tokenVisibleTo"]),
				...(isOwner && {
					damageRatio: clamp(character.damage / (character.strength + character.mobility), 0, 1),
					fatigueRatio: clamp(
						character.fatigue / (character.sense + character.intellect + character.wit),
						0,
						1,
					),
				}),
			}))
	}),
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		await getRoomOwnerOnlyContext(ctx, args.roomId)

		const dice: [number, number, number, number, number] = [4, 6, 8, 12, 20]
		const [strength, sense, mobility, intellect, wit] = dice.sort(() => Math.random() - 0.5)

		const startingCurrencies = [0, 10, 20, 50, 100, 500, 1000] as const

		return await ctx.db.insert("characters", {
			roomId: args.roomId,
			name: randomItem(characterNames) ?? "Cute Felirian",
			pronouns: randomItem(["he/him", "she/her", "they/them"]),
			fatigue: randomInt(0, 3),
			currency: randomItem(startingCurrencies),
			strength,
			sense,
			mobility,
			intellect,
			wit,
		})
	},
})

export const getPlayerCharacter = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: withResultResponse(async (ctx, args) => {
		const { player } = await getRoomPlayerContext(ctx, args.roomId)
		if (!player.characterId) {
			throw new ConvexError("You don't have a character. Ask the GM to assign one to you.")
		}

		const character =
			(await ctx.db.get(player.characterId)) ?? raise(new ConvexError("Character not found"))

		return {
			...defaultProperties,
			...pick(character, ["_id", ...keys(playerProperties)]),
			playerId: player.userId,
		}
	}),
})

export const update = mutation({
	args: {
		...characterProperties,
		id: v.id("characters"),
		playerId: nullish(v.id("users")),
	},
	handler: async (ctx, { id, playerId, ...args }) => {
		const character = (await ctx.db.get(id)) ?? raise(new ConvexError("Character not found"))
		const { room, player, isOwner } = await getRoomPlayerContext(ctx, character.roomId)

		if (isOwner) {
			if (playerId) {
				await ctx.db.patch(room._id, {
					players: room.players.map((player) =>
						player.userId === playerId ? { ...player, characterId: id } : player,
					),
				})
			}
			return await ctx.db.patch(id, {
				...args,
				imageId: await replaceFile(ctx, character.imageId, args.imageId),
			})
		}

		if (player.characterId === character._id) {
			return await ctx.db.patch(
				id,
				omit(
					{
						...args,
						imageId: await replaceFile(ctx, character.imageId, args.imageId),
					},
					keys(roomOwnerProperties),
				),
			)
		}

		throw new ConvexError("You don't have permission to edit this character.")
	},
})

export const remove = mutation({
	args: {
		id: v.id("characters"),
	},
	handler: async (ctx, args) => {
		const character = (await ctx.db.get(args.id)) ?? raise(new ConvexError("Character not found"))
		await getRoomOwnerOnlyContext(ctx, character.roomId)
		if (character.imageId) {
			await ctx.storage.delete(character.imageId)
		}
		await ctx.db.delete(args.id)
	},
})
