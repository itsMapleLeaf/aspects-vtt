import { brandedString, literals, nullable } from "convex-helpers/validators"
import { v } from "convex/values"
import { generateSlug } from "random-word-slugs"
import { omit } from "../app/common/object.ts"
import { randomItem } from "../app/common/random.ts"
import { CharacterModel } from "./CharacterModel.js"
import { RoomModel } from "./RoomModel.js"
import type { Doc } from "./_generated/dataModel.js"
import { type QueryCtx, mutation, query } from "./_generated/server.js"
import { requireDoc } from "./helpers.ts"
import { create as createMessage, diceInputValidator } from "./messages.ts"
import { tokenValidator } from "./token.js"
import { getUserFromIdentity } from "./users.js"

export const characterProperties = {
	// profile
	name: v.optional(v.string()),
	pronouns: v.optional(v.string()),
	imageId: v.optional(v.union(v.id("_storage"), v.null())),
	race: v.optional(v.string()),
	coreAspect: v.optional(nullable(v.string())),
	aspectSkills: v.optional(v.array(v.string())),

	// stats
	damage: v.optional(v.number()),
	damageThreshold: v.optional(nullable(v.number())),
	fatigue: v.optional(v.number()),
	fatigueThreshold: v.optional(nullable(v.number())),
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
		roomId: v.string(),
	},
	handler: async (ctx, args) => {
		const { value: user, error: userError } = await getUserFromIdentity(ctx)
		if (!user) {
			console.warn("Attempted to list characters without a user.", userError)
			return []
		}

		const roomId = ctx.db.normalizeId("rooms", args.roomId)
		const { value: room } = roomId
			? await RoomModel.fromId(ctx, roomId)
			: await RoomModel.fromSlug(ctx, args.roomId)
		if (!room) {
			return []
		}

		let query = ctx.db
			.query("characters")
			.withIndex("by_room", (q) => q.eq("roomId", room.data._id))

		const isRoomOwner = await room.isOwner()
		if (!isRoomOwner) {
			query = query.filter((q) =>
				q.or(q.eq(q.field("visible"), true), q.eq(q.field("playerId"), user.clerkId)),
			)
		}

		const docs = await query.collect()

		const results = await Promise.all(
			docs.map((doc) => new CharacterModel(ctx, doc)).map((model) => model.getComputedData()),
		)

		return results.sort((a, b) => a.name.localeCompare(b.name))
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.roomId).getValueOrThrow()
		await room.assertOwned()

		return await ctx.db.insert("characters", {
			...(await generateRandomCharacterProperties(ctx)),
			roomId: args.roomId,
		})
	},
})

export const duplicate = mutation({
	args: {
		id: v.id("characters"),
		randomize: v.boolean(),
	},
	handler: async (ctx, args) => {
		const { doc } = await CharacterModel.get(ctx, args.id).getValueOrThrow()
		return await ctx.db.insert("characters", {
			...omit(doc, ["_id", "_creationTime"]),
			...(args.randomize && (await generateRandomCharacterProperties(ctx))),
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
			v.union(v.object({ add: v.string() }), v.object({ remove: v.string() })),
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

export const applyStress = mutation({
	args: {
		id: v.id("characters"),
		property: literals("damage", "fatigue"),
		delta: literals(-1, 1),
		amount: v.number(),
		dice: v.array(diceInputValidator),
	},
	handler: async (ctx, args) => {
		const character = await requireDoc(ctx, args.id, "characters").getValueOrThrow()
		let amount = args.amount

		if (args.dice.length > 0) {
			let content = `Rolling for ${args.delta === -1 ? "healing" : "damage"} on <@${args.id}>`
			if (args.amount !== 0) {
				content += ` (+${args.amount})`
			}

			const message = await createMessage(ctx, {
				roomId: character.roomId,
				dice: args.dice,
				content: content,
			})

			amount += message.diceRoll?.dice.reduce((total, die) => total + die.result, 0) ?? 0
		}

		await update(ctx, {
			id: character._id,
			[args.property]: Math.max((character[args.property] ?? 0) + amount * args.delta, 0),
		})
	},
})

async function generateRandomCharacterProperties(ctx: QueryCtx) {
	const dice: [number, number, number, number, number] = [4, 6, 8, 12, 20]
	const [strength, sense, mobility, intellect, wit] = dice.sort(() => Math.random() - 0.5)

	const notionImports = await ctx.db.query("notionImports").order("desc").first()
	const race = randomItem(notionImports?.races ?? [])?.name
	const coreAspect = randomItem(notionImports?.aspects ?? [])?.name

	return {
		name: generateSlug(2, {
			categories: {
				noun: ["profession", "animals", "people"],
			},
			format: "title",
		}),
		pronouns: randomItem(["he/him", "she/her", "they/them"]),
		strength,
		sense,
		mobility,
		intellect,
		wit,
		race,
		coreAspect,
	} satisfies Partial<Doc<"characters">>
}
