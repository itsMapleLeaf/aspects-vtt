import { authTables } from "@convex-dev/auth/server"
import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { nullish } from "./lib/validators.ts"

const entSchema = defineEntSchema({
	users: defineEnt({
		...authTables.users.validator.fields,
		email: v.optional(v.string()),
	})
		.index("email", ["email"])
		.edges("rooms", { ref: true })
		.edges("messages", { ref: true })
		.edges("ownedCharacters", { to: "characters", ref: "ownerId" }),

	rooms: defineEnt({
		name: v.string(),
		slug: v.string(),
		activeSceneId: nullish(v.id("scenes")),
	})
		.edge("owner", { to: "users", field: "ownerId" })
		.edges("scenes", { ref: true })
		.edges("characters", { ref: true })
		.edges("messages", { ref: true })
		.index("slug", ["slug"]),

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
		// profile
		name: v.string(),
		pronouns: v.optional(v.string()),
		race: v.optional(v.string()),
		notes: v.optional(v.string()),
		imageId: nullish(v.id("_storage")),

		// attributes
		attributes: v.optional(
			v.object({
				strength: v.number(),
				sense: v.number(),
				mobility: v.number(),
				intellect: v.number(),
				wit: v.number(),
			}),
		),

		// status
		health: v.optional(v.number()),
		resolve: v.optional(v.number()),
		wealth: v.optional(v.number()),

		// token info
		battlemapPosition: v.optional(v.object({ x: v.number(), y: v.number() })),

		// permissions
		visible: v.optional(v.boolean()),
		nameVisible: v.optional(v.boolean()),
		tokenVisible: v.optional(v.boolean()),

		// metadata
		updatedAt: v.number(),

		// relations
		sceneId: nullish(v.id("scenes")),
		playerId: nullish(v.id("users")),
	})
		.index("sceneId", ["sceneId"])
		.index("playerId", ["playerId"])
		.edge("room")
		.edge("owner", { to: "users", field: "ownerId" })
		.searchIndex("name", {
			searchField: "name",
			filterFields: ["roomId", "sceneId", "playerId", "ownerId"],
		}),

	messages: defineEnt({
		blocks: v.array(
			v.union(
				v.object({
					type: v.literal("text"),
					text: v.string(),
				}),
				v.object({
					type: v.literal("diceRoll"),
					rolledDice: v.array(
						v.object({
							faces: v.number(),
							result: v.number(),
							operation: v.optional(v.literal("subtract")),
						}),
					),
				}),
			),
		),
	})
		.edge("author", { to: "users", field: "authorId" })
		.edge("room"),
})

export const entDefinitions = getEntDefinitions(entSchema)

export default defineSchema(
	{
		...entSchema.tables,
		...authTables,
		users: defineTable({
			...authTables.users.validator.fields,
			...entSchema.tables.users.validator.fields,
		}).index("email", ["email"]),
	},
	{
		schemaValidation: true,
	},
)
