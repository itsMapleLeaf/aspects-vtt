import { authTables } from "@convex-dev/auth/server"
import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { nullish } from "./lib/validators.ts"

const entSchema = defineEntSchema({
	users: defineEnt({
		...authTables.users.validator.fields,
		handle: v.string(),
		name: v.string(),
		email: v.optional(v.string()),
	})
		.index("handle", ["handle"])
		.index("email", ["email"])
		.edges("rooms", { ref: true }),

	rooms: defineEnt({
		name: v.string(),
		slug: v.string(),
		activeSceneId: nullish(v.id("scenes")),
	})
		.index("slug", ["slug"])
		.edge("user", { field: "ownerId" })
		.edges("scenes", { ref: true })
		.edges("characters", { ref: true }),

	scenes: defineEnt({
		name: v.string(),
		mode: v.union(v.literal("scenery"), v.literal("battlemap")),
		cellSize: v.optional(v.number()),
		dayBackgroundId: nullish(v.id("_storage")),
		eveningBackgroundId: nullish(v.id("_storage")),
		nightBackgroundId: nullish(v.id("_storage")),
	})
		.edge("room")
		.searchIndex("name", { searchField: "name", filterFields: ["roomId"] }),

	characters: defineEnt({
		sceneId: nullish(v.id("scenes")),

		name: v.string(),
		pronouns: v.optional(v.string()),
		imageId: nullish(v.id("_storage")),
		species: v.optional(v.string()),
		notes: v.optional(v.string()),

		strength: v.optional(v.number()),
		sense: v.optional(v.number()),
		mobility: v.optional(v.number()),
		intellect: v.optional(v.number()),
		wit: v.optional(v.number()),

		health: v.optional(v.number()),
		resolve: v.optional(v.number()),
	})
		.index("sceneId", ["sceneId"])
		.edge("room")
		.searchIndex("name", {
			searchField: "name",
			filterFields: ["roomId", "sceneId"],
		}),
})

export const entDefinitions = getEntDefinitions(entSchema)

export default defineSchema({
	...entSchema.tables,
	...authTables,
	users: defineTable({
		...authTables.users.validator.fields,
		...entSchema.tables.users.validator.fields,
	})
		.index("handle", ["handle"])
		.index("email", ["email"]),
})
