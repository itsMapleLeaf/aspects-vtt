import { brandedString, deprecated } from "convex-helpers/validators"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { characterProperties } from "./characters.ts"
import { notionImportProperties } from "./notionImports.ts"
import { rectangleProperties } from "./rectangles.ts"
import { roomProperties } from "./rooms.ts"

export default defineSchema({
	users: defineTable({
		clerkId: brandedString("clerkId"),
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	}).index("by_clerk_id", ["clerkId"]),

	rooms: defineTable({
		slug: v.string(),
		ownerId: brandedString("clerkId"),
		...roomProperties,
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
		tokenPosition: deprecated,
	}).index("by_room", ["roomId"]),

	notionImports: defineTable(notionImportProperties),

	rectangles: defineTable({
		...rectangleProperties,
		roomId: v.id("rooms"),
	}).index("by_roomId", ["roomId"]),
})
