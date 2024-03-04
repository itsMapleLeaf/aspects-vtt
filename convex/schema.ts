import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	rooms: defineTable({
		name: v.string(),
		slug: v.string(),
	}).index("by_slug", ["slug"]),
	messages: defineTable({
		roomId: v.id("rooms"),
		authorId: v.id("users"),
		content: v.string(),
	})
		.index("by_room", ["roomId"])
		.index("by_author", ["authorId"]),
})
