import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { characterFieldValidator } from "./characters.ts"
import { diceRollCreatePayload } from "./diceRolls.ts"

export default defineSchema({
	users: defineTable({
		username: v.string(),
		passwordHash: v.string(),
	}).index("by_username", ["username"]),

	sessions: defineTable({
		userId: v.id("users"),
	}).index("by_user", ["userId"]),

	rooms: defineTable({
		name: v.string(),
		slug: v.string(),
		mapImageId: v.optional(v.id("images")),
	}).index("by_slug", ["slug"]),

	diceRolls: defineTable({
		...diceRollCreatePayload,
		dice: v.array(
			v.object({
				key: v.string(),
				sides: v.number(),
				outcome: v.number(),
			}),
		),
	}).index("by_room", ["roomId"]),

	characters: defineTable({
		player: v.optional(v.string()),
		imageId: v.optional(v.id("images")),
		fields: v.optional(v.array(characterFieldValidator)),
		roomId: v.id("rooms"),
	}).index("by_room", ["roomId"]),

	mapTokens: defineTable({
		roomId: v.id("rooms"),
		x: v.optional(v.number()),
		y: v.optional(v.number()),
		characterId: v.id("characters"),
		overrides: v.optional(v.array(characterFieldValidator)),
	}).index("by_room", ["roomId"]),

	images: defineTable({
		storageId: v.id("_storage"),
		mimeType: v.string(),
	}).index("by_storage_id", ["storageId"]),
})
