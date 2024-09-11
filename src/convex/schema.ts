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
		mode: v.optional(v.union(v.literal("scenery"), v.literal("battlemap"))),
		sceneryBackgroundId: nullish(v.id("_storage")),
		battlemapBackgroundId: nullish(v.id("_storage")),
		cellSize: v.optional(v.number()),
	})
		.edge("room")
		.searchIndex("name", { searchField: "name", filterFields: ["roomId"] }),

	characters: defineEnt({
		name: v.string(),
		pronouns: v.optional(v.string()),
		imageId: nullish(v.id("_storage")),
		race: v.optional(v.string()),
		notes: v.optional(v.string()),

		attributes: v.optional(
			v.object({
				strength: v.number(),
				sense: v.number(),
				mobility: v.number(),
				intellect: v.number(),
				wit: v.number(),
			}),
		),

		health: v.optional(v.number()),
		resolve: v.optional(v.number()),

		sceneId: nullish(v.id("scenes")),
		battlemapPosition: v.optional(v.object({ x: v.number(), y: v.number() })),
		updatedAt: v.number(),
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
