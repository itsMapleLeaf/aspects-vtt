import { ConvexError, type Infer, v } from "convex/values"
import { omit, pick } from "#app/common/object.js"
import { randomInt, randomItem } from "#app/common/random.js"
import { characterNames } from "#app/features/characters/characterNames.ts"
import { mutation, query } from "./_generated/server.js"
import { getIdentityUser, requireIdentityUser } from "./auth.js"
import { nullish, requireDoc } from "./helpers.js"
import { requireOwnedRoom } from "./rooms.js"

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

	tokenPosition: v.optional(v.object({ x: v.number(), y: v.number() })),

	playerNotes: v.optional(v.string()),
}

export const characterProperties = {
	...roomOwnerProperties,
	...playerProperties,
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

	tokenPosition: { x: 0, y: 0 },
	visibleTo: "owner",
}

const keys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[]

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const user = await getIdentityUser(ctx)
		if (!user) return []

		const room = await ctx.db.get(args.roomId)
		if (!room) return []

		const playersByCharacterId = new Map(
			room?.players.flatMap((player) => (player.characterId ? [[player.characterId, player]] : [])),
		)

		let characters

		characters = await ctx.db
			.query("characters")
			.withIndex("by_room", (q) => q.eq("roomId", args.roomId))
			.collect()

		characters = characters.map((character) => ({
			...defaultProperties,
			...character,
			playerId: playersByCharacterId.get(character._id)?.userId ?? null,
		}))

		if (room.ownerId === user._id) {
			return characters
		}

		return characters.flatMap((character) => {
			if (character.visibleTo !== "everyone") {
				return []
			}
			return {
				...character,
				ownerNotes: "",
			}
		})
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		await requireOwnedRoom(ctx, args.roomId)

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
	handler: async (ctx, args) => {
		const user = await getIdentityUser(ctx)
		if (!user) return

		const room = await ctx.db.get(args.roomId)
		if (!room) return

		const player = room.players.find((player) => player.userId === user._id)
		if (!player?.characterId) return

		const character = await ctx.db.get(player.characterId)
		return (
			character && {
				...defaultProperties,
				...pick(character, ["_id", ...keys(playerProperties)]),
			}
		)
	},
})

export const update = mutation({
	args: {
		...characterProperties,
		id: v.id("characters"),
		playerId: nullish(v.id("users")),
	},
	handler: async (ctx, { id, playerId, ...args }) => {
		const user = await requireIdentityUser(ctx)
		const character = await requireDoc(ctx, "characters", id)
		const room = await requireDoc(ctx, "rooms", character.roomId)

		const isOwner = room.ownerId === user._id
		const isCharacterPlayer = room.players.some((player) => player.characterId === id)

		if (isOwner) {
			if (playerId) {
				await ctx.db.patch(room._id, {
					players: room.players.map((player) =>
						player.userId === playerId ? { ...player, characterId: id } : player,
					),
				})
			}
			return await ctx.db.patch(id, args)
		}
		if (isCharacterPlayer) {
			return await ctx.db.patch(id, omit(args, keys(roomOwnerProperties)))
		}
		throw new ConvexError("You don't have permission to edit this character.")
	},
})

export const remove = mutation({
	args: {
		id: v.id("characters"),
	},
	handler: async (ctx, args) => {
		const character = await ctx.db.get(args.id)
		if (character?.imageId) {
			await ctx.storage.delete(character.imageId)
		}
		await ctx.db.delete(args.id)
	},
})
