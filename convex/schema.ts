import { brandedString } from "convex-helpers/validators"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { characterProperties } from "./characters.ts"
import { notionImportProperties } from "./notionImports.ts"

export default defineSchema({
	users: defineTable({
		clerkId: brandedString("clerkId"),
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	}).index("by_clerk_id", ["clerkId"]),

	rooms: defineTable({
		name: v.string(),
		slug: v.string(),
		ownerId: brandedString("clerkId"),
		mapImageId: v.optional(v.id("_storage")),
		mapDimensions: v.optional(v.object({ width: v.number(), height: v.number() })),
		mapCellSize: v.optional(v.number()),
		experience: v.optional(v.number()),
	})
		.index("by_slug", ["slug"])
		.index("by_owner", ["ownerId"]),

	players: defineTable({
		roomId: v.id("rooms"),
		userId: brandedString("clerkId"),
	})
		.index("by_room", ["roomId"])
		.index("by_user", ["userId"])
		.index("by_room_and_user", ["roomId", "userId"]),

	messages: defineTable({
		roomId: v.id("rooms"),
		userId: brandedString("clerkId"),
		content: v.optional(v.string()),
		diceRoll: v.optional(
			v.object({
				dice: v.array(v.object({ key: v.string(), name: v.string(), result: v.number() })),
			}),
		),
	}).index("by_room", ["roomId"]),

	characters: defineTable({
		...characterProperties,
		roomId: v.id("rooms"),
	}).index("by_room", ["roomId"]),

	notionImports: defineTable(notionImportProperties),
})
