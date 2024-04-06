import { brandedString, nullable } from "convex-helpers/validators"
import { v } from "convex/values"
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
	coreAspect: v.optional(nullable(brandedString("aspectName"))),
	aspectSkills: v.optional(v.array(brandedString("aspectSkillName"))),

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

		return await Promise.all(
			docs
				.map((doc) => new CharacterModel(ctx, doc))
				.map(async (model) => await model.getComputedData()),
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
		aspectSkills: v.optional(
			v.union(
				v.object({ add: brandedString("aspectSkillName") }),
				v.object({ remove: brandedString("aspectSkillName") }),
			),
		),
	},
	handler: async (ctx, { id, aspectSkills, ...args }) => {
		const character = await CharacterModel.get(ctx, id).unwrap()

		let newAspectSkills
		if (aspectSkills) {
			if ("add" in aspectSkills) {
				newAspectSkills = [...character.data.aspectSkills, aspectSkills.add]
			}
			if ("remove" in aspectSkills) {
				newAspectSkills = character.data.aspectSkills.filter((name) => name !== aspectSkills.remove)
			}
		}

		await character.update(ctx, {
			...args,
			...(newAspectSkills && { aspectSkills: newAspectSkills }),
		})
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
