import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { nullish } from "./lib/validators.ts"

export default defineSchema({
	...authTables,

	users: defineTable({
		...authTables.users.validator.fields,
		handle: v.string(),
		name: v.string(),
		email: v.optional(v.string()),
	})
		.index("handle", ["handle"])
		.index("email", ["email"]),

	rooms: defineTable({
		name: v.string(),
		slug: v.string(),
		ownerId: v.id("users"),
		activeSceneId: nullish(v.id("scenes")),
	})
		.index("slug", ["slug"])
		.index("ownerId", ["ownerId"]),

	scenes: defineTable({
		name: v.string(),
		roomId: v.id("rooms"),
		mode: v.union(v.literal("scenery"), v.literal("battlemap")),
		cellSize: v.optional(v.number()),
		dayBackgroundId: nullish(v.id("_storage")),
		eveningBackgroundId: nullish(v.id("_storage")),
		nightBackgroundId: nullish(v.id("_storage")),
	})
		.index("roomId", ["roomId"])
		.searchIndex("name", { searchField: "name", filterFields: ["roomId"] }),
})
