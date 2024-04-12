import { brandedString, nullable } from "convex-helpers/validators"
import { v } from "convex/values"
import { omit } from "#app/common/object.js"
import { randomItem } from "#app/common/random.js"
import { characterNames } from "#app/features/characters/characterNames.ts"
import { CharacterModel } from "./CharacterModel.js"
import { RoomModel } from "./RoomModel.js"
import { mutation, query } from "./_generated/server.js"
import { tokenValidator } from "./token.js"
import { getUserFromIdentity } from "./users.js"

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
	token: v.optional(tokenValidator),

	// visibility
	visible: v.optional(v.boolean()),
	nameVisible: v.optional(v.boolean()),
	playerId: v.optional(nullable(brandedString("clerkId"))),
}

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const { value: user, error: userError } = await getUserFromIdentity(ctx)
		if (!user) {
			console.warn("Attempted to list characters without a user.", userError)
			return []
		}

		const { value: room } = await RoomModel.fromId(ctx, args.roomId)
		const isRoomOwner = await room?.isOwner()

		let query = ctx.db.query("characters").withIndex("by_room", (q) => q.eq("roomId", args.roomId))
		if (!isRoomOwner) {
			query = query.filter((q) =>
				q.or(q.eq(q.field("visible"), true), q.eq(q.field("playerId"), user.clerkId)),
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
		const room = await RoomModel.fromId(ctx, args.roomId).getValueOrThrow()
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
		const { doc } = await CharacterModel.get(ctx, args.id).getValueOrThrow()
		return await ctx.db.insert("characters", {
			...omit(doc, ["_id", "_creationTime"]),
			token: doc.token && {
				...doc.token,
				position: { x: doc.token.position.x + 1, y: doc.token.position.y },
			},
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
		const character = await CharacterModel.get(ctx, id).getValueOrThrow()

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
		const character = await CharacterModel.get(ctx, args.id).getValueOrThrow()
		await character.delete(ctx)
	},
})
