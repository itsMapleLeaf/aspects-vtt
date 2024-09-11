import { getManyFrom } from "convex-helpers/server/relationships"
import { literals, nullable } from "convex-helpers/validators"
import { ConvexError, type GenericId, v } from "convex/values"
import { Console, Data, Effect, pipe } from "effect"
import { Iterator } from "iterator-helpers-polyfill"
import { sum } from "lodash-es"
import { getWordsByCategory } from "random-word-slugs/words.ts"
import { AttributeTotal } from "~/modules/attributes/constants.ts"
import type { Attribute } from "~/modules/attributes/data.ts"
import {
	getAttributePower,
	normalizeAttributeValue,
} from "~/modules/attributes/helpers.ts"
import { getCharacterAttributeDiceKind } from "~/modules/characters/helpers.ts"
import {
	boostDiceKind,
	getDiceKindApiInput,
	snagDiceKind,
	statDiceKindsByName,
} from "~/modules/dice/data.tsx"
import { getRace } from "~/modules/races/data.ts"
import {
	type Skill,
	getAspectSkill,
	listAspectSkillIds,
	listAspectSkillsByAspect,
} from "../../app/modules/aspect-skills/data.ts"
import {
	type Aspect,
	getAspect,
	listAspects,
} from "../../app/modules/aspects/data.ts"
import { listRaceIds } from "../../app/modules/races/data.ts"
import { hasLength } from "../../common/array.ts"
import { unwrap } from "../../common/errors.ts"
import { clamp } from "../../common/math.ts"
import { fromEntries, keys, omit, pick } from "../../common/object.ts"
import { randomInt, randomItem } from "../../common/random.ts"
import { titleCase } from "../../common/string.ts"
import type { Id } from "../_generated/dataModel"
import type { Doc } from "../_generated/dataModel.js"
import { mutation } from "../api.ts"
import { getUserFromIdentityEffect } from "../auth.ts"
import { createDiceRolls } from "../dice/helpers.ts"
import {
	Convex,
	QueryCtxService,
	effectMutation,
	effectQuery,
	getDoc,
	insertDoc,
	internalEffectMutation,
	patchDoc,
	withMutationCtx,
	withQueryCtx,
} from "../helpers/effect.ts"
import { partial } from "../helpers/partial.ts"
import { createMessages } from "../messages/helpers.ts"
import { type DiceRoll, diceInputValidator } from "../messages/types.ts"
import { ensureViewerOwnsRoom } from "../rooms/functions.ts"
import schema from "../schema.ts"
import { userColorValidator } from "../types.ts"
import { getCurrentUser, getCurrentUserId } from "../users.old.ts"
import { characterAttributeValidator } from "./types.ts"

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
				Iterator.from(characters).map(normalizeCharacter),
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
		sceneId: nullable(v.id("scenes")),
	},
	handler(args) {
		return Effect.gen(function* () {
			const room = yield* ensureViewerOwnsRoom(args.roomId)
			const properties = generateRandomCharacterProperties()
			return yield* insertDoc("characters", {
				...properties,
				roomId: room._id,
				sceneId: args.sceneId,
			})
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
			const { character } = yield* ensureFullCharacterPermissions(args.id)
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
		...partial(schema.tables.characters.validator.fields),
		id: v.id("characters"),
	},
	handler: ({ id, ...args }) =>
		Effect.gen(function* () {
			yield* ensureFullCharacterPermissions(id)
			yield* withMutationCtx((ctx) => ctx.db.patch(id, args))
		}),
})

export const updateInternal = internalEffectMutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		id: v.id("characters"),
	},
	handler: ({ id, ...args }) => Convex.db.patch(id, args),
})

export const updateStatus = mutation({
	args: {
		characterIds: v.array(v.id("characters")),
		health: v.optional(v.number()),
		resolve: v.optional(v.number()),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			for (const characterId of args.characterIds) {
				const character = yield* normalizeCharacterUnsafe(
					yield* ctx.db.get(characterId),
				)
				yield* ctx.db.patch(characterId, {
					health: character.health + (args.health ?? 0),
					resolve: character.resolve + (args.resolve ?? 0),
				})
			}
		}).pipe(
			Effect.provideService(QueryCtxService, ctx.internal),
			Effect.catchTags({
				DocNotFoundById: () => Effect.succeed(null),
				NotLoggedInError: Effect.die,
			}),
		)
	},
})

export const randomize = effectMutation({
	args: {
		id: v.id("characters"),
	},
	handler(args) {
		return Effect.gen(function* () {
			yield* ensureFullCharacterPermissions(args.id)
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
			const { character } = yield* ensureFullCharacterPermissions(args.id)
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
				characters: Effect.forEach(args.characterIds, getDoc, {
					concurrency: "unbounded",
				}),
			})

			const characterRoomIds = [
				...new Set(characters.map((character) => character.roomId)),
			]
			if (!hasLength(characterRoomIds, 1)) {
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
				user: user._id,
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
			const { character } = yield* ensureFullCharacterPermissions(
				args.characterId,
			)

			const skill = yield* Effect.fromNullable(
				getAspectSkill(args.aspectSkillId),
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
				ctx.db.patch(character._id, { learnedAspectSkills }),
			)
		})
	},
})

export const updateConditions = effectMutation({
	args: {
		characterIds: v.array(v.id("characters")),
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
	handler({ characterIds, action }) {
		return Effect.forEach(
			characterIds,
			(characterId) =>
				Effect.gen(function* () {
					const { character } =
						yield* ensureFullCharacterPermissions(characterId)

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
						ctx.db.patch(character._id, { conditions }),
					)
				}),
			{ concurrency: "unbounded" },
		).pipe(Effect.asVoid)
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
			const characters = yield* ensureRoomHasCharacters(
				args.roomId,
				args.characterIds,
			)
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
			const { character } = yield* ensureFullCharacterPermissions(
				args.characterId,
			)

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

export const rest = effectMutation({
	args: {
		id: v.id("characters"),
	},
	handler(args) {
		return Effect.gen(function* () {
			const character = yield* normalizeCharacterUnsafe(
				yield* Convex.db.get(args.id),
			)
			const user = yield* getCurrentUser()
			const rolls = Array.from(
				createDiceRolls([getDiceKindApiInput(statDiceKindsByName.d4, 3)]),
			)
			const restoredAmount = rolls.reduce((total, die) => total + die.result, 0)

			yield* Convex.db.insert("messages", {
				roomId: character.roomId,
				user: user._id,
				content: `${formatCharacterMention(character._id)} rested for 8 hours and gained ${restoredAmount} resolve.`,
				diceRoll: {
					dice: rolls,
				},
			})

			yield* Convex.db.patch(character._id, {
				resolve: Math.min(
					character.resolve + restoredAmount,
					character.resolveMax,
				),
			})
		})
	},
})

export const attack = effectMutation({
	args: {
		attackerId: v.id("characters"),
		defenderIds: v.array(v.id("characters")),
		attackerAttribute: characterAttributeValidator,
		boostCount: v.optional(v.number()),
		snagCount: v.optional(v.number()),
	},
	handler(args) {
		return Effect.gen(function* () {
			const user = yield* getCurrentUser()
			const attacker = yield* normalizeCharacterUnsafe(
				yield* Convex.db.get(args.attackerId),
			)

			for (const defenderId of args.defenderIds) {
				const defender = yield* normalizeCharacterUnsafe(
					yield* Convex.db.get(defenderId),
				)

				const attackerRoll = Array.from(
					createDiceRolls(
						getCharacterAttributeDiceInputs({
							character: attacker,
							attribute: args.attackerAttribute,
							boostCount: args.boostCount,
							snagCount: args.snagCount,
						}),
					),
				)

				const potentialDamage = attackerRoll.reduce((total, die) => {
					return total + die.result * (die.name === snagDiceKind.name ? -1 : 1)
				}, 0)

				const attackerMention = formatCharacterMention(attacker._id)
				const defenderMention = formatCharacterMention(defender._id)

				const mobility = getAttributePower(defender.mobility)
				const strength = getAttributePower(defender.strength)

				let message
				let netDamage

				if (potentialDamage < mobility) {
					netDamage = 0
					message = `${attackerMention} tried to attack ${defenderMention} for ${potentialDamage}, but they evaded.`
				} else {
					netDamage = potentialDamage - strength
					message = `${attackerMention} attacked ${defenderMention} for ${potentialDamage} damage. They defended, reducing it to ${netDamage}.`
				}

				yield* Convex.db.insert("messages", {
					roomId: attacker.roomId,
					user: user._id,
					content: message,
					diceRoll: {
						dice: attackerRoll,
					},
				})

				yield* Convex.db.patch(defender._id, {
					health: defender.health - netDamage,
				})
			}
		})
	},
})

/** Rolls 1d4 and subtracts from the character's resolve */
export const extraCombatAction = mutation({
	args: {
		id: v.id("characters"),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const { character } = yield* ensureFullCharacterPermissions(args.id)
			const [...dice] = createDiceRolls([
				getDiceKindApiInput(statDiceKindsByName.d4, 1),
			])
			const die = unwrap(dice[0])

			yield* ctx.db.patch(args.id, {
				resolve: character.resolve - die.result,
			})

			yield* ctx.db.insert("messages", {
				roomId: character.roomId,
				user: character.player ?? undefined,
				content: `<@${character._id}> spent ${die.result} resolve for an extra combat action.`,
				diceRoll: {
					dice: [die],
				},
			})
		}).pipe(Effect.provideService(QueryCtxService, ctx.internal), Effect.orDie)
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
		const validAttributes = keys(attributes).filter(
			(key) => attributes[key] < 5,
		)
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
		const aspect =
			Math.random() > 0.1 ? preferredAspect : unwrap(randomItem(listAspects()))

		const learnedAspectSkills = Iterator.from(
			skillsByAspect.get(aspect.id) ?? [],
		)
			.map(getAspectSkill)
			.filter((skill): skill is Skill => skill != null)
			.toArray()

		const currentHighestTier =
			learnedAspectSkills.length > 0 ?
				greatestBy(learnedAspectSkills, (skill) => skill.tier.number).tier
					.number
			:	undefined

		const nextTier = currentHighestTier ? currentHighestTier + 1 : 1

		const validSkills = listAspectSkillsByAspect(aspect.id).filter(
			(skill) => skill.tier.number <= nextTier,
		)

		const newSkill = randomItem(validSkills)
		if (!newSkill) {
			continue // we ran out of skills for this tier lol
		}

		skillsByAspect.set(
			aspect.id,
			new Set(skillsByAspect.get(aspect.id)).add(newSkill.id),
		)
	}

	const race = unwrap(randomItem(listRaceIds()))
	const adjective =
		randomItem(getWordsByCategory("adjective", ["personality"])) ?? "A Random"

	return {
		...attributes,
		name: titleCase(`${adjective} ${race}`),
		pronouns: randomItem([
			"he/him",
			"she/her",
			"they/them",
			"he/they",
			"she/they",
		]),
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

export class MissingCharacterPermissionError extends Data.TaggedError(
	"MissingCharacterPermissionError",
) {
	constructor(readonly characterId: Id<"characters">) {
		super()
	}
}

export class CharactersNotInRoomError extends Data.TaggedError(
	"CharactersNotInRoomError",
) {
	constructor(readonly charactersNotInRoom: Array<Doc<"characters">>) {
		super()
	}
}

export class MissingCharacterImageError extends Data.TaggedError(
	"MissingCharacterImageError",
) {
	constructor(readonly characterId: Id<"characters">) {
		super()
	}
}

export class MissingImageSizesError extends Data.TaggedError(
	"MissingImageSizeError",
) {
	constructor(readonly imageId: Id<"images">) {
		super()
	}
}

export type NormalizedCharacter = Effect.Effect.Success<
	ReturnType<typeof normalizeCharacter>
>

export function normalizeCharacter(character: Doc<"characters">) {
	return Effect.gen(function* () {
		const normalized = yield* normalizeCharacterUnsafe(character)
		const userId = yield* getCurrentUserId()
		const room = yield* Convex.db.get(character.roomId)

		const isRoomOwner = room.owner === userId
		const isPlayer = character.player === userId

		if (isRoomOwner || isPlayer) {
			return { ...normalized, permission: "full" as const }
		}

		if (character.visible && character.nameVisible) {
			return {
				...pick(normalized, [
					"_id",
					"_creationTime",
					"roomId",
					"sceneId",
					"imageUrl",
					"conditions",
					"race",
					"visible",
					"nameVisible",
					"name",
					"pronouns",
				]),
				permission: "limitedWithName" as const,
			}
		}

		if (character.visible) {
			return {
				...pick(normalized, [
					"_id",
					"_creationTime",
					"roomId",
					"sceneId",
					"imageUrl",
					"conditions",
					"race",
					"visible",
					"nameVisible",
				]),
				permission: "limited" as const,
			}
		}

		return yield* new MissingCharacterPermissionError(character._id)
	}).pipe(Effect.tapError(Console.log))
}

export type UnsafeNormalizedCharacter = Effect.Effect.Success<
	ReturnType<typeof normalizeCharacterUnsafe>
>
export function normalizeCharacterUnsafe(character: Doc<"characters">) {
	return Effect.gen(function* () {
		const userId = yield* getCurrentUserId()

		const imageUrl: string | null = yield* pipe(
			Effect.fromNullable(character.image),
			Effect.catchTag(
				"NoSuchElementException",
				() => new MissingCharacterImageError(character._id),
			),
			Effect.flatMap((id) =>
				withQueryCtx((ctx) => ({
					storageId: ctx.db.system.normalizeId("_storage", id),
					imageId: ctx.db.normalizeId("images", id),
				})),
			),
			Effect.flatMap(({ storageId, imageId }) => {
				if (storageId) {
					return Convex.storage.getUrl(storageId)
				}
				if (imageId) {
					return pipe(
						Convex.db.get(imageId),
						Effect.flatMap((image) => Effect.fromNullable(image.sizes.at(-1))),
						Effect.catchTag(
							"NoSuchElementException",
							() => new MissingImageSizesError(imageId),
						),
						Effect.flatMap((size) => Convex.storage.getUrl(size.storageId)),
					)
				}
				return Effect.succeed(null)
			}),
			Effect.orElseSucceed(() => null),
		)

		const race = character.race && getRace(character.race)

		const stats = {
			strength: normalizeAttributeValue(character.strength),
			sense: normalizeAttributeValue(character.sense),
			mobility: normalizeAttributeValue(character.mobility),
			intellect: normalizeAttributeValue(character.intellect),
			wit: normalizeAttributeValue(character.wit),
		}

		const healthMax = sum(
			[stats.strength, stats.mobility, race?.healthBonus ?? 0].map(
				getAttributePower,
			),
		)
		const health = clamp(character.health ?? healthMax, 0, healthMax)

		const resolveMax = sum(
			[stats.intellect, stats.wit, stats.sense, race?.resolveBonus ?? 0].map(
				getAttributePower,
			),
		)
		const resolve = clamp(character.resolve ?? resolveMax, 0, resolveMax)

		return {
			name: "",
			pronouns: "",
			race: null,

			modifiers: [],
			learnedAspectSkills: [],

			ownerNotes: "",
			playerNotes: "",

			currency: 0,
			conditions: [],

			visible: false,
			nameVisible: false,
			player: null,

			...character,
			...stats,

			imageUrl,

			health,
			healthMax,

			resolve,
			resolveMax,

			isOwner: character.player != null && userId === character.player,
		}
	})
}

export function ensureFullCharacterPermissions(characterId: Id<"characters">) {
	return Effect.gen(function* () {
		const user = yield* getCurrentUser()
		const character = yield* getCharacter(characterId)
		const room = yield* getDoc(character.roomId)

		if (character.permission !== "full") {
			return yield* new MissingCharacterPermissionError(character._id)
		}

		return {
			user,
			room,
			character,
		}
	})
}

export function getCharacter(characterId: Id<"characters">) {
	return Convex.db.get(characterId).pipe(Effect.flatMap(normalizeCharacter))
}

export function ensureRoomHasCharacters(
	roomId: Id<"rooms">,
	characterIds: ReadonlyArray<Id<"characters">>,
) {
	return pipe(
		Effect.forEach(characterIds, getDoc, { concurrency: "unbounded" }),
		Effect.flatMap((characters) => {
			const charactersNotInRoom = characters.filter((c) => c.roomId !== roomId)
			return charactersNotInRoom.length === 0 ?
					Effect.succeed(characters)
				:	Effect.fail(new CharactersNotInRoomError(charactersNotInRoom))
		}),
		Effect.flatMap((characters) =>
			Effect.allSuccesses(characters.map(normalizeCharacterUnsafe)),
		),
	)
}

export function getCharacterAttributeDiceInputs(args: {
	character: UnsafeNormalizedCharacter
	attribute: Attribute["id"]
	boostCount?: number
	snagCount?: number
}) {
	const attributeDiceKind = getCharacterAttributeDiceKind(
		normalizeAttributeValue(args.character[args.attribute]),
	)

	let boostCount = args.boostCount ?? 0
	if (args.character.race) {
		const bonus = getRace(args.character.race)?.attributeRollBonuses?.[
			args.attribute
		]?.boost
		if (bonus) {
			boostCount += bonus
		}
	}

	return [
		getDiceKindApiInput(attributeDiceKind, 2),
		getDiceKindApiInput(boostDiceKind, boostCount),
		getDiceKindApiInput(snagDiceKind, args.snagCount ?? 0),
	]
}
