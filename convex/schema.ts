import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { characterProperties } from "./characters.ts"
import { nullish } from "./helpers.ts"

export default defineSchema({
	users: defineTable({
		clerkId: v.string(),
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	}).index("by_clerk_id", ["clerkId"]),

	rooms: defineTable({
		name: v.string(),
		slug: v.string(),
		ownerId: v.id("users"),
		mapImageId: v.optional(v.id("_storage")),
		mapDimensions: v.optional(v.object({ width: v.number(), height: v.number() })),
		mapCellSize: v.optional(v.number()),
		players: v.array(
			v.object({
				userId: v.id("users"),
				characterId: nullish(v.id("characters")),
			}),
		),
	})
		.index("by_slug", ["slug"])
		.index("by_owner", ["ownerId"]),

	messages: defineTable({
		roomId: v.id("rooms"),
		userId: v.id("users"),
		content: v.optional(v.string()),
		diceRoll: v.optional(
			v.object({
				dice: v.array(v.object({ key: v.string(), name: v.string(), result: v.number() })),
			}),
		),
	}).index("by_room", ["roomId"]),

	diceRolls: defineTable({
		roomId: v.id("rooms"),
		label: v.optional(v.string()),
		rolledBy: v.id("users"),
		dice: v.array(
			v.object({
				key: v.string(),
				name: v.string(),
				result: v.number(),
			}),
		),
	}).index("by_room", ["roomId"]),

	characters: defineTable({
		roomId: v.id("rooms"),
		...characterProperties,
	}).index("by_room", ["roomId"]),
})
