import { brandedString, nullable } from "convex-helpers/validators"
import { type Infer, v } from "convex/values"
import { omit } from "#app/common/object.js"
import { randomItem } from "#app/common/random.js"
import { Vector } from "#app/common/vector.js"
import { characterNames } from "#app/features/characters/characterNames.ts"
import { CharacterModel } from "./CharacterModel.js"
import { RoomModel } from "./RoomModel.js"
import { UserModel } from "./UserModel.js"
import { internalMutation, mutation, query } from "./_generated/server.js"

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
	visible: v.optional(v.boolean()),
	nameVisible: v.optional(v.boolean()),
	playerId: v.optional(nullable(brandedString("clerkId"))),
}

const characterDefaults: Required<{
	[K in keyof typeof characterProperties]: Exclude<
		Infer<(typeof characterProperties)[K]>,
		undefined
	>
}> = {
	// profile
	name: "",
	pronouns: "",
	imageId: null,
	race: "",

	// stats
	damage: 0,
	fatigue: 0,
	currency: 0,

	// attributes
	strength: 4,
	sense: 4,
	mobility: 4,
	intellect: 4,
	wit: 4,

	// notes
	ownerNotes: "",
	playerNotes: "",

	// token properties
	tokenPosition: { x: 0, y: 0 },

	// visibility
	visible: false,
	nameVisible: false,
	playerId: null,
}

export const migrate = internalMutation({
	async handler(ctx, args) {
		for await (const character of ctx.db.query("characters")) {
			await ctx.db.patch(character._id, { tokenVisibleTo: undefined, visibleTo: undefined })
		}
	},
})

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const user = await UserModel.fromIdentity(ctx)
		const { value: room } = await RoomModel.fromId(ctx, args.roomId)
		const isRoomOwner = await room?.isOwner()

		let query = ctx.db.query("characters")
		if (!isRoomOwner) {
			query = query.filter((q) =>
				q.or(q.eq(q.field("visible"), true), q.eq(q.field("playerId"), user.data.clerkId)),
			)
		}
		const docs = await query.collect()

		const getThreshold = (die: number) => {
			if (die === 20) return 10
			if (die === 12) return 8
			return 6
		}

		return docs
			.map((doc) => ({ ...characterDefaults, ...doc }))
			.map((doc) => ({
				...doc,
				damageThreshold: getThreshold(doc.strength),
				fatigueThreshold: getThreshold(doc.sense),
				isOwner: isRoomOwner || doc.playerId === user.data.clerkId,
				displayName:
					doc.nameVisible || isRoomOwner || doc.playerId === user.data.clerkId ? doc.name : "???",
				displayPronouns:
					doc.nameVisible || isRoomOwner || doc.playerId === user.data.clerkId ? doc.pronouns : "",
			}))
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
	},
	handler: async (ctx, { id, ...args }) => {
		const character = await CharacterModel.get(ctx, id).unwrap()
		await character.update(ctx, args)
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
