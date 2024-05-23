import { literals } from "convex-helpers/validators"
import { ConvexError, v } from "convex/values"
import { Effect } from "effect"
import { NoSuchElementException } from "effect/Cause"
import { generateSlug } from "random-word-slugs"
import { isTuple } from "../../app/common/array.ts"
import { fromEntries, omit, pick } from "../../app/common/object.ts"
import { randomItem } from "../../app/common/random.ts"
import { CharacterSkillTree } from "../../app/features/characters/skills.ts"
import { type Doc } from "../_generated/dataModel.js"
import {
	getUserFromIdentity,
	getUserFromIdentityEffect,
} from "../auth/helpers.ts"
import { createDiceRolls } from "../dice/helpers.ts"
import {
	effectMutation,
	getEntityDoc,
	insertDoc,
	updateDoc,
	withMutationCtx,
} from "../helpers/effect.ts"
import { mutation, query, type QueryCtx } from "../helpers/ents.ts"
import { diceInputValidator, type DiceRoll } from "../messages/types.ts"
import { RoomModel } from "../rooms/RoomModel.js"
import { userColorValidator } from "../types.ts"
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
		const { value: room } =
			roomId ?
				await RoomModel.fromId(ctx, roomId)
			:	await RoomModel.fromSlug(ctx, args.roomId)
		if (!room) {
			return []
		}

		let query = ctx.db
			.query("characters")
			.withIndex("by_room", (q) => q.eq("roomId", room.data._id))

		const isRoomOwner = await room.isOwner()
		if (!isRoomOwner) {
			query = query.filter((q) =>
				q.or(
					q.eq(q.field("visible"), true),
					q.eq(q.field("playerId"), user.clerkId),
				),
			)
		}

		const docs = await query.collect()

		const results = await Promise.all(
			docs
				.map((doc) => new CharacterModel(ctx, doc))
				.map((model) => model.getComputedData()),
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

export const update = effectMutation({
	args: {
		...characterProperties,
		id: v.id("characters"),
	},
	handler: ({ id, ...args }) =>
		Effect.gen(function* () {
			yield* ensureViewerCharacterPermissions(id)
			yield* withMutationCtx((ctx) =>
				ctx.table("characters").getX(id).patch(args),
			)
		}),
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

export const applyStress = effectMutation({
	args: {
		characterIds: v.array(v.id("characters")),
		properties: v.array(literals("damage", "fatigue")),
		amount: v.number(),
		dice: v.array(diceInputValidator),
		delta: literals(-1, 1), // whether to add or subtract the dice result
	},
	handler(args) {
		return Effect.gen(function* () {
			if (args.properties.length === 0) {
				return yield* Effect.fail(
					new ConvexError("At least one property must be specified"),
				)
			}

			if (args.characterIds.length === 0) {
				return yield* Effect.fail(
					new ConvexError("At least one character must be specified"),
				)
			}

			const { user, characters } = yield* Effect.all({
				user: getUserFromIdentityEffect(),
				characters: Effect.forEach(
					args.characterIds,
					(id) => getEntityDoc("characters", id),
					{ concurrency: "unbounded" },
				),
			})

			const characterRoomIds = [
				...new Set(characters.map((character) => character.roomId)),
			]
			if (!isTuple(characterRoomIds, 1)) {
				return yield* Effect.fail(
					new ConvexError("Characters must all be in the same room"),
				)
			}
			const roomId = characterRoomIds[0]

			let amount = args.amount
			let diceRolls: DiceRoll[] | undefined

			if (args.dice.length > 0) {
				diceRolls = [...createDiceRolls(args.dice)]
				amount +=
					diceRolls.reduce((total, die) => total + die.result, 0) * args.delta
			}

			const listFormat = new Intl.ListFormat("en-US", {
				type: "conjunction",
			})

			const characterMentions = listFormat.format(
				characters.map((character) => `<@${character._id}>`),
			)

			const stressTypes = listFormat.format(args.properties)

			let content
			if (amount > 0) {
				content = `Dealt ${Math.abs(amount)} ${stressTypes} to ${characterMentions}.`
			} else if (amount < 0) {
				content = `Healed ${Math.abs(amount)} ${stressTypes} from ${characterMentions}.`
			} else {
				content = `No damage or healing was applied.`
			}

			yield* Effect.forEach(
				characters,
				(character) => {
					const data = fromEntries(
						args.properties.map((property) => [
							property,
							Math.max((character[property] ?? 0) + amount, 0),
						]),
					)
					return updateDoc(character._id, data)
				},
				{ concurrency: "unbounded" },
			)

			yield* insertDoc("messages", {
				roomId,
				userId: user.clerkId,
				content,
				diceRoll: diceRolls && { dice: diceRolls },
			})
		})
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
			const { character } = yield* ensureViewerCharacterPermissions(
				args.characterId,
			)

			const skill = yield* Effect.orElseFail(
				Effect.fromNullable(
					CharacterSkillTree.skillsById.get(args.aspectSkillId),
				),
				() =>
					new NoSuchElementException(
						`Couldn't find aspect skill with id "${args.aspectSkillId}"`,
					),
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
				ctx
					.table("characters")
					.getX(character._id)
					.patch({ learnedAspectSkills }),
			)
		})
	},
})

export const updateConditions = effectMutation({
	args: {
		characterId: v.id("characters"),
		action: v.union(
			v.object({
				type: v.literal("add"),
				name: v.string(),
				color: userColorValidator(),
			}),
			v.object({
				type: v.literal("remove"),
				name: v.string(),
			}),
			v.object({
				type: v.literal("clear"),
			}),
		),
	},
	handler({ characterId, action }) {
		return Effect.gen(function* () {
			const { character } = yield* ensureViewerCharacterPermissions(characterId)

			let conditions = character.conditions ?? []
			if (action.type === "add") {
				conditions = [...conditions, pick(action, ["name", "color"])]
			} else if (action.type === "remove") {
				conditions = conditions.filter(
					(condition) => condition.name !== action.name,
				)
			} else if (action.type === "clear") {
				conditions = []
			}

			yield* withMutationCtx((ctx) =>
				ctx.table("characters").getX(character._id).patch({ conditions }),
			)
		})
	},
})

async function generateRandomCharacterProperties(ctx: QueryCtx) {
	const dice: [number, number, number, number, number] = [4, 6, 8, 12, 20]
	const [strength, sense, mobility, intellect, wit] = dice.sort(
		() => Math.random() - 0.5,
	)

	const notionImports = await ctx.db
		.query("notionImports")
		.order("desc")
		.first()
	const race = randomItem(notionImports?.races ?? [])?.name

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
	} satisfies Partial<Doc<"characters">>
}
