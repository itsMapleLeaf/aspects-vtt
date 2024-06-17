import { brandedString, deprecated } from "convex-helpers/validators"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { characterAspectSkillProperties } from "./characterAspectSkills/types.ts"
import { characterProperties } from "./characters/types.ts"
import { diceMacroProperties } from "./diceMacros/types.ts"
import { nullish } from "./helpers/convex.ts"
import { diceInputValidator, diceRollValidator } from "./messages/types.ts"
import { roomCombatValidator } from "./rooms/combat/types.ts"
import { roomProperties } from "./rooms/types.ts"
import { sceneProperties } from "./scenes/types.ts"

export default defineSchema({
	users: defineTable({
		name: v.string(),
		avatarUrl: v.optional(v.string()),
		clerkId: userClerkIdValidator(),
	}).index("clerkId", ["clerkId"]),

	rooms: defineTable({
		...roomProperties,
		slug: v.string(),
		ownerId: userClerkIdValidator(),
		combat: nullish(roomCombatValidator),
	})
		.index("slug", ["slug"])
		.index("ownerId", ["ownerId"]),

	players: defineTable({
		userId: userClerkIdValidator(),
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
	})
		.index("userId", ["userId"])
		.index("roomId", ["roomId"])
		.index("roomId_userId", ["roomId", "userId"]),

	diceMacros: defineTable({
		...diceMacroProperties,
		userId: userClerkIdValidator(),
	}).index("roomId_userId", ["roomId", "userId"]),

	messages: defineTable({
		roomId: v.id("rooms"),
		userId: userClerkIdValidator(),
		content: v.optional(v.string()),
		diceRoll: v.optional(v.object({ dice: v.array(diceRollValidator) })),
	}).index("roomId", ["roomId"]),

	characters: defineTable({
		...characterProperties,
		roomId: v.id("rooms"),
		tokenPosition: deprecated,
	}).index("roomId", ["roomId"]),

	scenes: defineTable(sceneProperties).index("roomId", ["roomId"]),

	characterAspectSkills: defineTable({
		...characterAspectSkillProperties,
	}).index("characterId", ["characterId"]),
})

function userClerkIdValidator() {
	return brandedString("clerkId")
}
