import { literals } from "convex-helpers/validators"
import { v } from "convex/values"
import { Effect } from "effect"
import { NoSuchElementException } from "effect/Cause"
import { generateSlug } from "random-word-slugs"
import { omit } from "../../app/common/object.ts"
import { randomItem } from "../../app/common/random.ts"
import { CharacterSkillTree } from "../../app/features/characters/skills.ts"
import type { Doc } from "../_generated/dataModel.js"
import { getUserFromIdentity } from "../auth/helpers.ts"
import { requireDoc } from "../helpers/convex.ts"
import { effectMutation, withMutationCtx } from "../helpers/effect.ts"
import { type QueryCtx, mutation, query } from "../helpers/ents.ts"
import { create as createMessage } from "../messages/functions.ts"
import { diceInputValidator } from "../messages/types.ts"
import { RoomModel } from "../rooms/RoomModel.js"
import { CharacterModel } from "./CharacterModel.js"
import { ensureViewerCharacterPermissions } from "./helpers.ts"
import { characterProperties } from "./types.ts"

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
		roomId: v.id("rooms"),
		characterIds: v.array(v.id("characters")),
		property: literals("damage", "fatigue"),
		delta: literals(-1, 1),
		amount: v.number(),
		dice: v.array(diceInputValidator),
	},
	handler: async (ctx, args) => {
		const characters = await Promise.all(
			args.characterIds.map((id) => requireDoc(ctx, id, "characters").getValueOrThrow()),
		)

		for (const character of characters) {
			if (character.roomId !== args.roomId) {
				throw new Error(
					`Character ${character._id} "${character.name}" has invalid room ${character.roomId}, expected ${args.roomId}`,
				)
			}
		}

		let amount = args.amount

		if (args.dice.length > 0) {
			let content = `Rolling for ${args.delta === -1 ? "healing" : "damage"}!`
			if (args.amount !== 0) {
				content += ` (+${args.amount})`
			}

			const message = await createMessage(ctx, {
				roomId: args.roomId,
				dice: args.dice,
				content: content,
			})

			amount += message.diceRoll?.dice.reduce((total, die) => total + die.result, 0) ?? 0
		}

		await Promise.all(
			characters.map((character) =>
				update(ctx, {
					id: character._id,
					[args.property]: Math.max((character[args.property] ?? 0) + amount * args.delta, 0),
				}),
			),
		)
	},
})

export const setSkillActive = effectMutation({
	args: {
		characterId: v.id("characters"),
		aspectSkillId: v.string(),
		active: v.boolean(),
	},
	handler(args) {
		return Effect.gen(function* () {
			const { character } = yield* ensureViewerCharacterPermissions(args.characterId)

			const skill = yield* Effect.orElseFail(
				Effect.fromNullable(CharacterSkillTree.skillsById.get(args.aspectSkillId)),
				() =>
					new NoSuchElementException(`Couldn't find aspect skill with id "${args.aspectSkillId}"`),
			)

			const aspectSkillGroups = new Map(
				character.learnedAspectSkills?.map((doc) => [
					doc.aspectId,
					{ ...doc, aspectSkillIds: new Set(doc.aspectSkillIds) },
				]),
			)

			let aspectGroup = aspectSkillGroups.get(skill.aspect.id)
			if (!aspectGroup) {
				aspectGroup = {
					aspectId: skill.aspect.id,
					aspectSkillIds: new Set(),
				}
				aspectSkillGroups.set(skill.aspect.id, aspectGroup)
			}

			if (args.active) {
				aspectGroup.aspectSkillIds.add(skill.id)
			} else {
				aspectGroup.aspectSkillIds.delete(skill.id)
			}

			const learnedAspectSkills = [...aspectSkillGroups.values()]
				.map((doc) => ({ ...doc, aspectSkillIds: [...doc.aspectSkillIds] }))
				.filter((doc) => doc.aspectSkillIds.length > 0)

			yield* withMutationCtx((ctx) =>
				ctx.table("characters").getX(character._id).patch({ learnedAspectSkills }),
			)
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
