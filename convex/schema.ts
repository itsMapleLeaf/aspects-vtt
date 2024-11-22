import { authTables } from "@convex-dev/auth/server"
import {
	defineEnt,
	defineEntFromTable,
	defineEntSchema,
	getEntDefinitions,
} from "convex-ents"
import { literals, nullable } from "convex-helpers/validators"
import { defineSchema } from "convex/server"
import { v } from "convex/values"
import { diceRollResultValidator } from "./dice.ts"
import { nullish, partial } from "./lib/validators.ts"

export const roomItemValidator = v.object({
	name: v.string(),
	effect: v.string(),
	flavor: v.optional(v.string()),
	wealthTier: v.number(),
})

export const characterItemValidator = v.object({
	// allow additional overrides per-character
	...partial(roomItemValidator.fields),
	quantity: v.optional(v.number()),
})

export const vectorValidator = v.object({
	x: v.number(),
	y: v.number(),
})

const entSchema = defineEntSchema({
	users: defineEntFromTable(authTables.users)
		.edges("ownedRooms", { to: "rooms", ref: "ownerId" })
		.edges("joinedRooms", { to: "rooms", table: "rooms_to_players" })
		.edges("messages", { ref: true })
		.edges("ownedCharacters", { to: "characters", ref: "ownerId" })
		.edges("pings", { ref: true }),

	rooms: defineEnt({
		name: v.string(),
		slug: v.string(),
		activeSceneId: nullish(v.id("scenes")),
		items: v.optional(v.record(v.string(), roomItemValidator)),
		combat: v.optional(
			v.union(
				v.null(),
				v.object({
					memberIds: v.array(v.id("characters")),
					currentMemberId: v.optional(v.id("characters")),
				}),
			),
		),
	})
		.index("slug", ["slug"])
		.edge("owner", { to: "users", field: "ownerId" })
		.edges("players", { to: "users", table: "rooms_to_players" })
		.edges("scenes", { ref: true })
		.edges("characters", { ref: true })
		.edges("messages", { ref: true })
		.edges("pings", { ref: true }),

	pings: defineEnt({
		position: vectorValidator,

		// we use a manually generated key so that we can match a client optimistic ping
		// with the one that later gets created on the server
		key: v.string(),
	})
		.edge("room")
		.edge("user"),

	scenes: defineEnt({
		name: v.string(),
		mode: v.optional(v.union(v.literal("scenery"), v.literal("battlemap"))),
		sceneryBackgroundId: nullish(v.id("_storage")),
		battlemapBackgroundId: nullish(v.id("_storage")),
		cellSize: v.optional(v.number()),
	})
		.edge("room")
		.edges("characterTokens", { ref: true })
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

		// skills
		aspectSkills: v.optional(v.record(v.string(), v.string())),

		// status
		health: v.optional(v.number()),
		healthMaxOverride: v.optional(nullable(v.number())),
		resolve: v.optional(v.number()),
		resolveMaxOverride: v.optional(nullable(v.number())),
		wealth: v.optional(v.number()),
		inventory: v.optional(v.record(v.string(), characterItemValidator)),
		conditions: v.optional(v.array(v.string())),

		// permissions
		visible: v.optional(v.boolean()),
		nameVisible: v.optional(v.boolean()),

		// metadata
		type: v.optional(literals("player", "npc")),
		updatedAt: v.number(),
		defaultTokenSize: v.optional(v.number()),

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

	characterTokens: defineEnt({
		type: v.optional(literals("character", "activity", "area")),
		position: v.optional(vectorValidator),
		visible: v.optional(v.boolean()),
		updatedAt: v.optional(v.number()),
		characterId: nullish(v.id("characters")),
		size: v.optional(vectorValidator),
	})
		.edge("scene")
		.index("characterId_sceneId", ["characterId", "sceneId"]),

	messages: defineEnt({
		content: v.array(
			v.union(
				v.object({
					type: v.literal("text"),
					text: v.string(),
				}),
				v.object({
					type: v.literal("dice"),
					dice: v.array(diceRollResultValidator),
				}),
			),
		),
	})
		.edge("author", { to: "users", field: "authorId" })
		.edge("room"),
})

export const entDefinitions = getEntDefinitions(entSchema)

export default defineSchema({ ...authTables, ...entSchema.tables })
