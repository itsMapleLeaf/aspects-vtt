import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

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
		owner: v.id("users"),
	})
		.index("slug", ["slug"])
		.index("owner", ["owner"]),
})
