import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { characterFieldValidator } from "./characters.ts"
import { diceRollCreatePayload } from "./diceRolls.ts"

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
	})
		.index("by_slug", ["slug"])
		.index("by_owner", ["ownerId"]),

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
		roomId: v.id("rooms"),
		playerId: v.optional(v.id("users")),
		imageId: v.optional(v.union(v.id("_storage"), v.null())),
		fields: v.optional(v.array(characterFieldValidator)),
	}).index("by_room", ["roomId"]),

	mapTokens: defineTable({
		roomId: v.id("rooms"),
		x: v.optional(v.number()),
		y: v.optional(v.number()),
		characterId: v.id("characters"),
		overrides: v.optional(v.array(characterFieldValidator)),
	}).index("by_room", ["roomId"]),
})
