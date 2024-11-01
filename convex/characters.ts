import type { WithoutSystemFields } from "convex/server"
import { ConvexError, v } from "convex/values"
import { compact } from "lodash-es"
import { match } from "ts-pattern"
import {
	getAttributeDie,
	normalizeCharacterAttributes,
} from "~/features/characters/helpers.ts"
import { DEFAULT_WEALTH_TIER } from "~/features/characters/wealth.ts"
import { rollDice } from "../shared/random.ts"
import { Doc, type Id } from "./_generated/dataModel"
import { InaccessibleError, ensureUserId } from "./auth.ts"
import {
	EntQueryCtx,
	mutation,
	query,
	type Ent,
	type EntMutationCtx,
} from "./lib/ents.ts"
import { partial } from "./lib/validators.ts"
import { isRoomOwner } from "./rooms.ts"
import schema from "./schema.ts"

export const get = query({
	args: {
		characterId: v.id("characters"),
	},
	async handler(ctx, args) {
		try {
			const userId = await ensureUserId(ctx)
			const ent = await ctx.table("characters").getX(args.characterId)
			return await protectCharacterEnt(ent, userId)
		} catch {
			return null
		}
	},
})

export const list = query({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	async handler(ctx, args) {
		try {
			const userId = await ensureUserId(ctx)

			let query
			if (args.search) {
				query = ctx
					.table("characters")
					.search("name", (q) =>
						q.search("name", args.search!).eq("roomId", args.roomId),
					)
			} else {
				query = ctx.table("characters", "roomId", (q) =>
					q.eq("roomId", args.roomId),
				)
			}

			const characters = await query
			const protectedCharacters = await Promise.all(
				characters.map((ent) => protectCharacterEnt(ent, userId)),
			)
			return compact(protectedCharacters)
		} catch {
			return []
		}
	},
})

export const create = mutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		roomId: v.id("rooms"),
	},
	async handler(ctx, args) {
		const userId = await ensureUserId(ctx)
		return await createCharacter(ctx, userId, args)
	},
})

export const update = mutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		characterId: v.id("characters"),
		aspectSkills: v.optional(
			v.object({
				add: v.optional(v.string()),
				remove: v.optional(v.string()),
			}),
		),
	},
	async handler(ctx, { characterId, aspectSkills, ...props }) {
		const userId = await ensureUserId(ctx)
		const ent = await ctx.table("characters").getX(characterId)
		const character = normalizeCharacter(ent)
		const room = await ctx.table("rooms").getX(character.roomId)

		const isCharacterAdmin =
			room.ownerId === userId ||
			character.playerId === userId ||
			character.ownerId === userId

		if (!isCharacterAdmin) {
			throw new ConvexError("Unauthorized")
		}

		const newAspectSkills = { ...character.aspectSkills }
		if (aspectSkills?.add) {
			newAspectSkills[aspectSkills.add] = aspectSkills.add
		}
		if (aspectSkills?.remove) {
			delete newAspectSkills[aspectSkills.remove]
		}

		const nextCharacter = normalizeCharacter({
			...ent.doc(),
			...props,
		})

		// match the character's health and resolve to the next character's
		// if it was previously equal
		const health = props.health ?? character.health
		const currentHealthMax = character.healthMax
		const nextHealthMax = nextCharacter.healthMax
		const nextHealth =
			health === currentHealthMax
				? nextHealthMax
				: Math.min(health, nextHealthMax)

		const resolve = props.resolve ?? character.resolve
		const currentResolveMax = character.resolveMax
		const nextResolveMax = nextCharacter.resolveMax
		const nextResolve =
			resolve === currentResolveMax
				? nextResolveMax
				: Math.min(resolve, nextResolveMax)

		return normalizeCharacter(
			await ctx
				.table("characters")
				.getX(characterId)
				.patch({
					...props,
					aspectSkills: newAspectSkills,
					health: nextHealth,
					resolve: nextResolve,
				})
				.get()
				.doc(),
		)
	},
})

export const updateMany = mutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		characterId: v.optional(v.id("characters")),
		aspectSkills: v.optional(
			v.object({
				add: v.optional(v.string()),
				remove: v.optional(v.string()),
			}),
		),
		updates: v.optional(
			v.array(
				v.object({
					...partial(schema.tables.characters.validator.fields),
					characterId: v.id("characters"),
					aspectSkills: v.optional(
						v.object({
							add: v.optional(v.string()),
							remove: v.optional(v.string()),
						}),
					),
				}),
			),
		),
	},
	async handler(ctx, { updates = [], ...args }) {
		if (args.characterId) {
			updates.push({ ...args, characterId: args.characterId })
		}
		const results = []
		for (const input of updates) {
			results.push(await update(ctx.internal, input))
		}
		return results
	},
})

export const remove = mutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	async handler(ctx, args) {
		for (const id of args.characterIds) {
			const { character } = await queryViewableCharacter(
				ctx,
				ctx.table("characters").get(id),
			)
			await character.delete()
		}
	},
})

export const duplicate = mutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	async handler(ctx, args) {
		const characters = await ctx
			.table("characters")
			.getManyX(args.characterIds)
			.docs()
		return await Promise.all(
			characters.map(({ _id, _creationTime, ...props }) =>
				ctx.table("characters").insert(props),
			),
		)
	},
})

export async function protectCharacterEnt(
	ent: Ent<"characters">,
	userId: Id<"users">,
) {
	const room = await ent.edgeX("room")
	const normalized = normalizeCharacter(ent.doc())
	return protectCharacter(normalized, userId, room)
}

function createCharacter(
	ctx: EntMutationCtx,
	userId: Id<"users">,
	args: Partial<WithoutSystemFields<Doc<"characters">>> & {
		roomId: Id<"rooms">
	},
) {
	return ctx.table("characters").insert({
		name: "New Character",
		...args,
		ownerId: userId,
		updatedAt: Date.now(),
	})
}

export type NormalizedCharacter = ReturnType<typeof normalizeCharacter>

export function normalizeCharacter(doc: Doc<"characters">) {
	const attributes = normalizeCharacterAttributes(doc.attributes)

	const bonuses = match(doc.race)
		.with("Myrmadon", () => ({ health: 10, resolve: 0 }))
		.with("Sylvanix", () => ({ health: 0, resolve: 5 }))
		.otherwise(() => ({ health: 0, resolve: 0 }))

	const healthMax =
		doc.healthMaxOverride ??
		getAttributeDie(attributes.strength) +
			getAttributeDie(attributes.mobility) +
			bonuses.health

	const resolveMax =
		doc.resolveMaxOverride ??
		attributes.sense + attributes.intellect + attributes.wit + bonuses.resolve

	const normalized = {
		...doc,

		type: doc.type ?? "npc",

		race: doc.race,

		attributes,

		movementSpeed: getAttributeDie(attributes.mobility),

		health: Math.min(doc.health ?? healthMax, healthMax),
		healthMax,

		resolve: Math.min(doc.resolve ?? resolveMax, resolveMax),
		resolveMax,

		wealth: doc.wealth ?? DEFAULT_WEALTH_TIER,

		conditions: doc.conditions ?? [],
	}
	return normalized satisfies Doc<"characters">
}

export type ProtectedCharacter = NonNullable<
	ReturnType<typeof protectCharacter>
>

export function protectCharacter(
	character: NormalizedCharacter,
	userId: Id<"users">,
	room: Doc<"rooms">,
) {
	const isAdmin = isCharacterAdmin(character, room, userId)

	const visible = (() => {
		if (isAdmin) return true
		if (!character.visible) return false
		if (character.sceneId == null) return true
		if (character.sceneId === room.activeSceneId) return true
		return false
	})()

	if (!visible) {
		return null
	}

	return {
		_id: character._id,
		imageId: character.imageId,
		sceneId: character.sceneId,
		race: character.race,
		conditions: character.conditions,
		type: character.type,
		name: character.nameVisible || isAdmin ? character.name : null,
		pronouns: character.pronouns,
		isAdmin,
		isPlayer: character.playerId === userId,
		full: isAdmin ? character : null,
	}
}

async function queryViewableCharacter<EntType extends Ent<"characters">>(
	ctx: EntQueryCtx,
	query: PromiseLike<EntType | null>,
) {
	const character = await query
	if (!character) {
		throw new InaccessibleError({ table: "characters" })
	}

	const room = await character.edgeX("room")
	const userId = await ensureUserId(ctx)
	const authorized = isCharacterAdmin(character, room, userId)

	if (!authorized) {
		throw new InaccessibleError({ table: "characters", id: character._id })
	}

	return { character, room, userId }
}

export function isCharacterAdmin(
	character: Doc<"characters">,
	room: Doc<"rooms">,
	userId: Id<"users">,
) {
	return (
		isRoomOwner(room, userId) ||
		character.ownerId === userId ||
		character.playerId === userId
	)
}

export async function ensureCharacterEntAdmin(
	ctx: EntQueryCtx,
	character: Ent<"characters">,
) {
	const userId = await ensureUserId(ctx)
	const room = await character.edgeX("room")
	if (isCharacterAdmin(character, room, userId)) {
		return character
	}
	throw new InaccessibleError({ id: character._id, table: "characters" })
}

export const attack = mutation({
	args: {
		characterIds: v.array(v.id("characters")),
		attackerId: v.id("characters"),
		attribute: v.union(
			v.literal("strength"),
			v.literal("sense"),
			v.literal("mobility"),
			v.literal("intellect"),
			v.literal("wit"),
		),
		pushYourself: v.boolean(),
		sneakAttack: v.boolean(),
	},
	async handler(ctx, args) {
		const userId = await ensureUserId(ctx)
		const { characterIds, attackerId, attribute, pushYourself, sneakAttack } =
			args

		const { character: attackerEnt } = await queryViewableCharacter(
			ctx,
			ctx.table("characters").get(attackerId),
		)
		const attackerNormalized = normalizeCharacter(attackerEnt.doc())

		const attackerDie = getAttributeDie(
			attackerNormalized.attributes[attribute],
		)
		const attackRoll = rollDice(attackerDie, 2)
		let damage = attackRoll.total
		let newResolve = attackerNormalized.resolve

		if (sneakAttack) {
			damage *= 2
			newResolve -= 3
		}

		let boostRoll: ReturnType<typeof rollDice> | undefined
		if (pushYourself) {
			boostRoll = rollDice(6, 1)
			damage += boostRoll.total
			newResolve -= 2
		}

		if (newResolve !== attackerNormalized.resolve) {
			await attackerEnt.patch({
				resolve: Math.max(0, newResolve),
			})
		}

		const defenders = await Promise.all(
			characterIds.map(async (id) => {
				const ent = await ctx.table("characters").getX(id)
				return normalizeCharacter(ent.doc())
			}),
		)

		const mention = (character: { _id: Id<"characters"> }) =>
			`<@${character._id}>`

		const defenderText =
			defenders.length === 1
				? mention(defenders[0]!)
				: `${defenders.length} targets`

		const messageContent: Doc<"messages">["content"] = [
			{
				type: "text",
				text: `${mention(attackerEnt)} made an attack against ${
					defenderText
				} for ${damage} damage.`,
			},
			{
				type: "dice",
				dice: [
					...attackRoll.results.map((result) => ({
						faces: attackerDie,
						result: result,
					})),
					...(boostRoll
						? [{ faces: 6, result: boostRoll.total, color: "green" }]
						: []),
				],
			},
		]

		for (const defender of defenders) {
			const evasion = getAttributeDie(defender.attributes.mobility)
			if (evasion > damage) {
				messageContent.push({
					type: "text",
					text: `${mention(defender)} evaded with ${evasion} evasion.`,
				})
				return
			}

			const defense = getAttributeDie(defender.attributes.strength)
			const damageTaken = Math.max(1, damage - defense)
			const health = Math.max(0, defender.health - damageTaken)

			await ctx.table("characters").getX(defender._id).patch({ health: health })

			messageContent.push({
				type: "text",
				text: `${mention(defender)} reduced the damage by ${defense} and lost ${damageTaken} health. ${
					health === 0 ? " They are down." : ""
				}`,
			})
		}

		await ctx.table("messages").insert({
			roomId: attackerEnt.roomId,
			authorId: userId,
			content: messageContent,
		})

		return { success: true }
	},
})
