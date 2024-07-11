import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	...authTables,
	users: defineTable({
		...authTables.users.validator.fields,
		name: v.string(),
	}),
})
