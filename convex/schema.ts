import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { characterCreatePayload } from "./characters.ts"
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
		...characterCreatePayload,
		name: v.string(),
		values: v.optional(
			v.array(
				v.object({
					key: v.string(),
					value: v.union(v.string(), v.number(), v.boolean()),
				}),
			),
		),
	}).index("by_room", ["roomSlug"]),
})
