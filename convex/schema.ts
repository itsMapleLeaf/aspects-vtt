import { brandedString, deprecated } from "convex-helpers/validators"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { characterProperties } from "./characters/functions.ts"
import { diceMacroProperties } from "./diceMacros/functions.ts"
import { nullish } from "./helpers/convex.ts"
import { diceInputValidator, diceRollValidator } from "./messages/functions.ts"
import { notionImportProperties } from "./notionImports/functions.ts"
import { roomCombatValidator } from "./rooms/combat/functions.ts"
import { roomProperties } from "./rooms/functions.ts"
import { sceneProperties } from "./scenes/types.ts"

export default defineSchema({
	users: defineTable({
		clerkId: brandedString("clerkId"),
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	}).index("by_clerk_id", ["clerkId"]),

	rooms: defineTable({
		...roomProperties,
		slug: v.string(),
		ownerId: brandedString("clerkId"),
		combat: nullish(roomCombatValidator),
	})
		.index("by_slug", ["slug"])
		.index("by_owner", ["ownerId"]),

	players: defineTable({
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

	diceMacros: defineTable({
		...diceMacroProperties,
		userId: brandedString("clerkId"),
	}).index("by_room_and_user", ["roomId", "userId"]),

	messages: defineTable({
		roomId: v.id("rooms"),
		userId: brandedString("clerkId"),
		content: v.optional(v.string()),
		diceRoll: v.optional(diceRollValidator),
	}).index("by_room", ["roomId"]),

	characters: defineTable({
		...characterProperties,
		roomId: v.id("rooms"),
		tokenPosition: deprecated,
	}).index("by_room", ["roomId"]),

	notionImports: defineTable(notionImportProperties),

	scenes: defineTable(sceneProperties).index("by_room", ["roomId"]),
})
