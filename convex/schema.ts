import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { characterFieldValidator } from "./characters.ts"
import { diceRollCreatePayload } from "./diceRolls.ts"

export default defineSchema({
	rooms: defineTable({
		name: v.string(),
		slug: v.string(),
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
	}).index("by_room", ["roomSlug"]),

	characters: defineTable({
		player: v.optional(v.string()),
		imageId: v.optional(v.id("images")),
		fields: v.optional(v.array(characterFieldValidator)),
		roomSlug: v.string(),
	}).index("by_room", ["roomSlug"]),

	mapTokens: defineTable({
		roomSlug: v.string(),
		x: v.optional(v.number()),
		y: v.optional(v.number()),
		characterId: v.id("characters"),
		overrides: v.optional(v.array(characterFieldValidator)),
	}).index("by_room", ["roomSlug"]),

	images: defineTable({
		storageId: v.id("_storage"),
		mimeType: v.string(),
	}).index("by_storage_id", ["storageId"]),
})
