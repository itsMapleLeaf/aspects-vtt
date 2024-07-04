import { getManyFrom } from "convex-helpers/server/relationships"
import { literals } from "convex-helpers/validators"
import { ConvexError, v, type GenericId } from "convex/values"
import { Console, Effect } from "effect"
import { Iterator } from "iterator-helpers-polyfill"
import { getWordsByCategory } from "random-word-slugs/words.ts"
import { AttributeTotal } from "~/modules/attributes/constants.ts"
import { isTuple } from "../../app/helpers/array.ts"
import { unwrap } from "../../app/helpers/errors.ts"
import { fromEntries, keys, omit, pick } from "../../app/helpers/object.ts"
import { randomInt, randomItem } from "../../app/helpers/random.ts"
import { titleCase } from "../../app/helpers/string.ts"
import {
	getAspectSkill,
	listAspectSkillIds,
	listAspectSkillsByAspect,
	type Skill,
} from "../../app/modules/aspect-skills/data.ts"
import { getAspect, listAspects, type Aspect } from "../../app/modules/aspects/data.ts"
import { listRaceIds } from "../../app/modules/races/data.ts"
import type { Doc } from "../_generated/dataModel.js"
import { getUserFromIdentityEffect } from "../auth/helpers.ts"
import { createDiceRolls } from "../dice/helpers.ts"
import {
	effectMutation,
	effectQuery,
	getDoc,
	insertDoc,
	patchDoc,
	withMutationCtx,
	withQueryCtx,
} from "../helpers/effect.ts"
import { createMessages } from "../messages/helpers.ts"
import { diceInputValidator, type DiceRoll } from "../messages/types.ts"
import { ensureViewerOwnsRoom } from "../rooms/helpers.ts"
import { userColorValidator } from "../types.ts"
import {
	ensureRoomHasCharacters,
	ensureViewerCharacterPermissions,
	getCharacterAttributeDiceInputs,
	normalizeCharacter,
	protectCharacter,
} from "./helpers.ts"
import { characterAttributeValidator, characterProperties } from "./types.ts"

export const list = effectQuery({
	args: {
		roomId: v.id("rooms"),
	},
	handler(args) {
		return Effect.gen(function* () {
			const characters = yield* withQueryCtx((ctx) =>
				getManyFrom(ctx.db, "characters", "roomId", args.roomId),
			)
			return yield* Effect.allSuccesses(
				Iterator.from(characters).map(normalizeCharacter).map(protectCharacter),
			)
		}).pipe(
			Effect.tapError(Console.warn),
			Effect.orElseSucceed(() => []),
		)
	},
})

export const create = effectMutation({
	args: {
		roomId: v.id("rooms"),
	},
	handler(args) {
		return Effect.gen(function* () {
			const room = yield* ensureViewerOwnsRoom(args.roomId)
			const properties = generateRandomCharacterProperties()
			return yield* insertDoc("characters", { ...properties, roomId: room._id })
		})
	},
})

export const duplicate = effectMutation({
	args: {
		id: v.id("characters"),
		randomize: v.boolean(),
	},
	handler(args) {
		return Effect.gen(function* () {
			const { character } = yield* ensureViewerCharacterPermissions(args.id)
			const properties = omit(character, ["_id", "_creationTime"])
			if (args.randomize) {
				Object.assign(properties, generateRandomCharacterProperties())
			}
			return yield* insertDoc("characters", properties)
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
			yield* withMutationCtx((ctx) => ctx.db.patch(id, args))
		}),
})

export const randomize = effectMutation({
	args: {
		id: v.id("characters"),
	},
	handler(args) {
		return Effect.gen(function* () {
			yield* ensureViewerCharacterPermissions(args.id)
			yield* patchDoc(args.id, generateRandomCharacterProperties())
		})
	},
})

export const remove = effectMutation({
	args: {
		id: v.id("characters"),
	},
	handler(args) {
		return Effect.gen(function* () {
			const { character } = yield* ensureViewerCharacterPermissions(args.id)
			yield* withMutationCtx((ctx) => ctx.db.delete(character._id))
		})
	},
})

export const applyStress = effectMutation({
	args: {
		characterIds: v.array(v.id("characters")),
		properties: v.array(literals("health" as const, "resolve" as const)),
		amount: v.number(),
		dice: v.array(diceInputValidator),
		delta: literals(-1, 1), // whether to add or subtract the dice result
	},
	handler(args) {
		return Effect.gen(function* () {
			if (args.properties.length === 0) {
				return yield* Effect.fail(new ConvexError("At least one property must be specified"))
			}

			if (args.characterIds.length === 0) {
				return yield* Effect.fail(new ConvexError("At least one character must be specified"))
			}

			const { user, characters } = yield* Effect.all({
				user: getUserFromIdentityEffect(),
				characters: Effect.forEach(args.characterIds, getDoc, {
					concurrency: "unbounded",
				}),
			})

			const characterRoomIds = [...new Set(characters.map((character) => character.roomId))]
			if (!isTuple(characterRoomIds, 1)) {
				return yield* Effect.fail(new ConvexError("Characters must all be in the same room"))
			}
			const roomId = characterRoomIds[0]

			let amount = args.amount
			let diceRolls: DiceRoll[] | undefined

			if (args.dice.length > 0) {
				diceRolls = [...createDiceRolls(args.dice)]
				amount += diceRolls.reduce((total, die) => total + die.result, 0) * args.delta
			}

			const listFormat = new Intl.ListFormat("en-US", {
				type: "conjunction",
			})

			const characterMentions = listFormat.format(
				characters.map((it) => formatCharacterMention(it._id)),
			)

			const stressTypes = listFormat.format(args.properties)

			let content
			if (amount > 0) {
				content = `Healed ${characterMentions} for ${Math.abs(amount)} ${stressTypes}.`
			} else if (amount < 0) {
				content = `Removed ${Math.abs(amount)} ${stressTypes} from ${characterMentions}.`
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
					return patchDoc(character._id, data)
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
		aspectSkillId: literals(...listAspectSkillIds()),
		active: v.boolean(),
	},
	handler(args) {
		return Effect.gen(function* () {
			const { character } = yield* ensureViewerCharacterPermissions(args.characterId)

			const skill = getAspectSkill(args.aspectSkillId)

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

			yield* withMutationCtx((ctx) => ctx.db.patch(character._id, { learnedAspectSkills }))
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
				conditions = conditions.filter((condition) => condition.name !== action.name)
			} else if (action.type === "clear") {
				conditions = []
			}

			yield* withMutationCtx((ctx) => ctx.db.patch(character._id, { conditions }))
		})
	},
})

export const rollAttribute = effectMutation({
	args: {
		roomId: v.id("rooms"),
		characterIds: v.array(v.id("characters")),
		attribute: characterAttributeValidator,
		boostCount: v.optional(v.number()),
		snagCount: v.optional(v.number()),
	},
	handler(args) {
		return Effect.gen(function* () {
			const characters = yield* ensureRoomHasCharacters(args.roomId, args.characterIds)
			return yield* createMessages(
				characters.map((character) => {
					const dice = getCharacterAttributeDiceInputs({ ...args, character })
					return {
						roomId: args.roomId,
						content: `${formatCharacterMention(character._id)} rolled ${titleCase(args.attribute)}`,
						dice,
					}
				}),
			)
		})
	},
})

export const updateModifier = effectMutation({
	args: {
		characterId: v.id("characters"),
		attribute: characterAttributeValidator,
		boostDice: v.optional(v.number()),
		snagDice: v.optional(v.number()),
		attributeDice: v.optional(v.number()),
	},
	handler(args) {
		return Effect.gen(function* () {
			const { character } = yield* ensureViewerCharacterPermissions(args.characterId)

			const modifiers = new Map(
				character.modifiers?.map((modifier) => [modifier.attribute, modifier]),
			)

			modifiers.set(args.attribute, {
				// defaults
				attribute: args.attribute,
				boostDice: 0,
				snagDice: 0,
				attributeDice: 0,

				// override with existing
				...modifiers.get(args.attribute),

				// apply args
				...pick(args, ["boostDice", "snagDice", "attributeDice"]),
			})

			yield* withMutationCtx((ctx) =>
				ctx.db.patch(character._id, {
					modifiers: [...modifiers.values()],
				}),
			)
		})
	},
})

function generateRandomCharacterProperties() {
	const attributes = {
		strength: 1,
		sense: 1,
		mobility: 1,
		intellect: 1,
		wit: 1,
	}
	for (let i = 5; i < AttributeTotal; i++) {
		const validAttributes = keys(attributes).filter((key) => attributes[key] < 5)
		const randomKey = unwrap(randomItem(validAttributes))
		attributes[randomKey] += 1
	}

	// the character should prefer skills with an aspect that matches their strongest attribute
	const preferredAspect = greatestBy(
		[
			{ stat: attributes.strength, aspect: getAspect("fire") },
			{ stat: attributes.sense, aspect: getAspect("water") },
			{ stat: attributes.mobility, aspect: getAspect("wind") },
			{ stat: attributes.intellect, aspect: getAspect("light") },
			{ stat: attributes.wit, aspect: getAspect("darkness") },
		],
		(item) => item.stat,
	).aspect

	const skillsByAspect = new Map<Aspect["id"], Set<Skill["id"]>>()

	for (const _i of Iterator.range(randomInt(5, 30))) {
		// small chance of going outside their preferred aspect
		const aspect = Math.random() > 0.1 ? preferredAspect : unwrap(randomItem(listAspects()))

		const learnedAspectSkills = Iterator.from(skillsByAspect.get(aspect.id) ?? [])
			.map(getAspectSkill)
			.toArray()

		const currentHighestTier =
			learnedAspectSkills.length > 0 ?
				greatestBy(learnedAspectSkills, (skill) => skill.tier.number).tier.number
			:	undefined

		const nextTier = currentHighestTier ? currentHighestTier + 1 : 1

		const validSkills = listAspectSkillsByAspect(aspect.id).filter(
			(skill) => skill.tier.number <= nextTier,
		)

		const newSkill = randomItem(validSkills)
		if (!newSkill) {
			continue // we ran out of skills for this tier lol
		}

		skillsByAspect.set(aspect.id, new Set(skillsByAspect.get(aspect.id)).add(newSkill.id))
	}

	const race = unwrap(randomItem(listRaceIds()))
	const adjective = randomItem(getWordsByCategory("adjective", ["personality"])) ?? "A Random"

	return {
		...attributes,
		name: titleCase(`${adjective} ${race}`),
		pronouns: randomItem(["he/him", "she/her", "they/them", "he/they", "she/they"]),
		race,
		currency: (Math.floor(Math.random() * 10) + 1) * 50,
		learnedAspectSkills: Iterator.from(skillsByAspect)
			.map(([aspectId, skillIds]) => ({
				aspectId,
				aspectSkillIds: [...skillIds],
			}))
			.toArray(),
	} satisfies Partial<Doc<"characters">>
}

function greatestBy<T>(items: Iterable<T>, rank: (item: T) => number) {
	return Iterator.from(items).reduce((a, b) => (rank(a) > rank(b) ? a : b))
}

function formatCharacterMention(id: GenericId<"characters">) {
	return `<@${id}>`
}
