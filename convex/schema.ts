import { authTables } from "@convex-dev/auth/server"
import { migrationsTable } from "convex-helpers/server/migrations"
import { brandedString, deprecated, literals, nullable } from "convex-helpers/validators"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { listRaceIds } from "~/modules/races/data.ts"
import { characterAspectSkillProperties } from "./characterAspectSkills/types.ts"
import { characterAttributeValidator, characterConditionValidator } from "./characters/types.ts"
import { diceMacroProperties } from "./diceMacros/types.ts"
import { nullish } from "./helpers/convex.ts"
import { diceInputValidator, diceRollValidator } from "./messages/types.ts"
import { roomCombatValidator } from "./rooms/combat/types.ts"
import { roomProperties } from "./rooms/types.ts"
import { sceneProperties } from "./scenes/types.ts"

export default defineSchema({
	...authTables,

	migrations: migrationsTable,

	users: defineTable({
		...authTables.users.validator.fields,
		name: v.string(),
		avatarUrl: v.optional(v.string()),
		image: v.optional(v.id("images")),
		clerkId: deprecated,
	}).index("email", ["email"]),

	images: defineTable({
		name: v.string(),
		hash: v.string(),
		sizes: v.array(
			v.object({
				width: v.number(),
				height: v.number(),
				storageId: v.id("_storage"),
			}),
		),
	}).index("hash", ["hash"]),

	rooms: defineTable({
		...roomProperties,
		slug: v.string(),
		owner: v.optional(v.id("users")),
		combat: nullish(roomCombatValidator),
		ownerId: deprecated,
	})
		.index("slug", ["slug"])
		.index("owner", ["owner"]),

	players: defineTable({
		user: v.optional(v.id("users")),
		roomId: v.id("rooms"),
		diceMacros: v.optional(
			v.array(
				v.object({
					key: brandedString("diceMacro"),
					name: v.string(),
					dice: diceInputValidator,
				}),
			),
		),
		userId: deprecated,
	})
		.index("user", ["user"])
		.index("roomId", ["roomId"])
		.index("roomId_user", ["roomId", "user"]),

	diceMacros: defineTable({
		...diceMacroProperties,
		user: v.optional(v.id("users")),
		userId: deprecated,
	}).index("roomId_user", ["roomId", "user"]),

	messages: defineTable({
		roomId: v.id("rooms"),
		user: v.optional(v.id("users")),
		content: v.optional(v.string()),
		diceRoll: v.optional(v.object({ dice: v.array(diceRollValidator) })),
		userId: deprecated,
	}).index("roomId", ["roomId"]),

	characters: defineTable({
		roomId: v.id("rooms"),

		// profile
		name: v.optional(v.string()),
		pronouns: v.optional(v.string()),
		image: nullish(v.id("images")),
		race: nullish(literals(...listRaceIds())),

		// stats
		strength: v.optional(v.number()),
		sense: v.optional(v.number()),
		mobility: v.optional(v.number()),
		intellect: v.optional(v.number()),
		wit: v.optional(v.number()),
		modifiers: v.optional(
			v.array(
				v.object({
					attribute: characterAttributeValidator,
					boostDice: v.number(),
					snagDice: v.number(),
					attributeDice: v.number(),
				}),
			),
		),
		learnedAspectSkills: v.optional(
			// keep track of the order of aspects to calculate the correct EXP costs
			v.array(
				v.object({
					aspectId: v.string(),
					aspectSkillIds: v.array(v.string()),
				}),
			),
		),

		// status
		health: v.optional(v.number()),
		resolve: v.optional(v.number()),
		currency: v.optional(v.number()),
		conditions: v.optional(v.array(characterConditionValidator())),

		// notes
		ownerNotes: v.optional(v.string()),
		playerNotes: v.optional(v.string()),

		// visibility
		visible: v.optional(v.boolean()),
		nameVisible: v.optional(v.boolean()),
		player: v.optional(nullable(v.id("users"))),
		playerId: deprecated,

		imageId: deprecated,
		tokenPosition: deprecated,
		token: deprecated,
		coreAspect: deprecated,
		aspectSkills: deprecated,
		damageThreshold: deprecated,
		fatigueThreshold: deprecated,
		damage: deprecated,
		fatigue: deprecated,
		damageThresholdDelta: deprecated,
		fatigueThresholdDelta: deprecated,
	})
		.index("roomId", ["roomId"])
		.index("player", ["player"]),

	scenes: defineTable(sceneProperties).index("roomId", ["roomId"]),

	characterAspectSkills: defineTable({
		...characterAspectSkillProperties,
	}).index("characterId", ["characterId"]),
})
