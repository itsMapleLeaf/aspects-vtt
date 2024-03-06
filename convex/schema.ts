import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	rooms: defineTable({
		name: v.string(),
		slug: v.string(),
	}).index("by_slug", ["slug"]),

	diceRolls: defineTable({
		roomId: v.id("rooms"),
		author: v.string(),
		dice: v.array(
			v.object({
				sides: v.number(),
				outcome: v.number(),
			}),
		),
	}).index("by_room", ["roomId"]),
})
