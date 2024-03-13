import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { characterCreatePayload, characterValueObjectValidator } from "./characters.ts"
import { diceRollCreatePayload } from "./diceRolls.ts"
import { mapTokenFieldValidator } from "./mapTokens.ts"

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
		...characterCreatePayload,
		name: v.string(),
		values: v.optional(v.array(characterValueObjectValidator)),
		imageId: v.optional(v.id("images")),
	}).index("by_room", ["roomSlug"]),

	mapTokens: defineTable({
		roomSlug: v.string(),
		x: v.number(),
		y: v.number(),
		imageId: v.optional(v.id("images")),
		fields: v.optional(v.array(mapTokenFieldValidator)),

		// deprecated
		name: v.optional(v.string()),
		health: v.optional(v.number()),
		maxHealth: v.optional(v.number()),
		fatigue: v.optional(v.number()),
	}).index("by_room", ["roomSlug"]),

	images: defineTable({
		storageId: v.id("_storage"),
		mimeType: v.string(),
	}).index("by_storage_id", ["storageId"]),
})
