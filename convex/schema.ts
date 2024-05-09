import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents"
import { brandedString, deprecated } from "convex-helpers/validators"
import { v } from "convex/values"
import { characterProperties } from "./characters/types.ts"
import { diceMacroProperties } from "./diceMacros/types.ts"
import { nullish } from "./helpers/convex.ts"
import { diceInputValidator } from "./messages/types.ts"
import { diceRollValidator } from "./messages/types.ts"
import { notionImportProperties } from "./notionImports/types.ts"
import { roomCombatValidator } from "./rooms/combat/types.ts"
import { roomProperties } from "./rooms/types.ts"
import { sceneProperties } from "./scenes/types.ts"

export { schema as default, entDefinitions }

const schema = defineEntSchema({
	users: defineEnt({
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	}).field("clerkId", brandedString("clerkId"), { unique: true }),

	rooms: defineEnt({
		...roomProperties,
		combat: nullish(roomCombatValidator),
	})
		.field("slug", v.string(), { unique: true })
		.field("ownerId", brandedString("clerkId"), { index: true }),

	players: defineEnt({
		roomId: v.id("rooms"),
		userId: brandedString("clerkId"),
		diceMacros: v.optional(
			v.array(
				v.object({
					key: brandedString("diceMacro"),
					name: v.string(),
					dice: diceInputValidator,
				}),
			),
		),
	})
		.index("by_room", ["roomId"])
		.index("by_user", ["userId"])
		.index("by_room_and_user", ["roomId", "userId"]),

	diceMacros: defineEnt({
		...diceMacroProperties,
		userId: brandedString("clerkId"),
	}).index("by_room_and_user", ["roomId", "userId"]),

	messages: defineEnt({
		roomId: v.id("rooms"),
		userId: brandedString("clerkId"),
		content: v.optional(v.string()),
		diceRoll: v.optional(diceRollValidator),
	}).index("by_room", ["roomId"]),

	characters: defineEnt({
		...characterProperties,
		roomId: v.id("rooms"),
		tokenPosition: deprecated,
	}).index("by_room", ["roomId"]),

	notionImports: defineEnt(notionImportProperties),

	scenes: defineEnt(sceneProperties).index("by_room", ["roomId"]),
})

const entDefinitions = getEntDefinitions(schema)
