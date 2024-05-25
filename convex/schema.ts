import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents"
import { brandedString, deprecated } from "convex-helpers/validators"
import { v } from "convex/values"
import { characterAspectSkillProperties } from "./characterAspectSkills/types.ts"
import { characterProperties } from "./characters/types.ts"
import { defineTables } from "./crud.ts"
import { diceMacroProperties } from "./diceMacros/types.ts"
import { nullish } from "./helpers/convex.ts"
import { diceInputValidator, diceRollValidator } from "./messages/types.ts"
import { notionImportProperties } from "./notionImports/types.ts"
import { roomCombatValidator } from "./rooms/combat/types.ts"
import { roomProperties } from "./rooms/types.ts"
import { sceneProperties } from "./scenes/types.ts"

export { schema as default, entDefinitions }

const schema = defineEntSchema({
	users: defineEnt({
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	}).field("clerkId", brandedString("clerkId"), { unique: true }),

	rooms: defineEnt({
		...roomProperties,
		combat: nullish(roomCombatValidator),
	})
		.edges("players", { ref: "roomId" })
		.field("slug", v.string(), { unique: true })
		.field("ownerId", brandedString("clerkId"), { index: true }),

	players: defineEnt({
		userId: brandedString("clerkId"),
		diceMacros: v.optional(
			v.array(
				v.object({
					key: brandedString("diceMacro"),
					name: v.string(),
					dice: diceInputValidator,
				}),
			),
		),
	})
		.edge("room", { field: "roomId" })
		.index("by_user", ["userId"])
		.index("by_room_and_user", ["roomId", "userId"]),

	diceMacros: defineEnt({
		...diceMacroProperties,
		userId: brandedString("clerkId"),
	}).index("by_room_and_user", ["roomId", "userId"]),

	messages: defineEnt({
		roomId: v.id("rooms"),
		userId: brandedString("clerkId"),
		content: v.optional(v.string()),
		diceRoll: v.optional(v.object({ dice: v.array(diceRollValidator) })),
	}).index("by_room", ["roomId"]),

	characters: defineEnt({
		...characterProperties,
		roomId: v.id("rooms"),
		tokenPosition: deprecated,
	})
		.index("by_room", ["roomId"])
		.edges("characterAspectSkills", { ref: true }),

	notionImports: defineEnt(notionImportProperties),

	scenes: defineEnt(sceneProperties).index("by_room", ["roomId"]),

	characterAspectSkills: defineEnt({
		...characterAspectSkillProperties,
	}).edge("character", { field: "characterId" }),

	/* GENERATE-ENT */
})

const entDefinitions = getEntDefinitions(schema)

export const { createCrudFunctions } = defineTables({
	users: {
		name: v.string(),
		avatarUrl: v.optional(v.string()),
		clerkId: brandedString("clerkId"),
	}, //.field("clerkId", brandedString("clerkId"), { unique: true }),

	rooms: {
		name: v.optional(v.string()),
		slug: v.string(),
		ownerId: brandedString("clerkId"),
		experience: v.optional(v.number()),
		currentScene: v.optional(v.id("scenes")),
		gameTime: v.optional(v.number()), // measured in days since the start of year 0
		combat: nullish(roomCombatValidator),

		mapImageId: deprecated,
		mapDimensions: deprecated,
		mapCellSize: deprecated,
	},
	// .edges("players", { ref: "roomId" })
	// .field("slug", v.string(), { unique: true })
	// .field("ownerId", brandedString("clerkId"), { index: true }),

	// players: defineEnt({
	// 	userId: brandedString("clerkId"),
	// 	diceMacros: v.optional(
	// 		v.array(
	// 			v.object({
	// 				key: brandedString("diceMacro"),
	// 				name: v.string(),
	// 				dice: diceInputValidator,
	// 			}),
	// 		),
	// 	),
	// })
	// 	.edge("room", { field: "roomId" })
	// 	.index("by_user", ["userId"])
	// 	.index("by_room_and_user", ["roomId", "userId"]),

	// diceMacros: defineEnt({
	// 	...diceMacroProperties,
	// 	userId: brandedString("clerkId"),
	// }).index("by_room_and_user", ["roomId", "userId"]),

	// messages: defineEnt({
	// 	roomId: v.id("rooms"),
	// 	userId: brandedString("clerkId"),
	// 	content: v.optional(v.string()),
	// 	diceRoll: v.optional(v.object({ dice: v.array(diceRollValidator) })),
	// }).index("by_room", ["roomId"]),

	// characters: defineEnt({
	// 	...characterProperties,
	// 	roomId: v.id("rooms"),
	// 	tokenPosition: deprecated,
	// })
	// 	.index("by_room", ["roomId"])
	// 	.edges("characterAspectSkills", { ref: true }),

	// notionImports: defineEnt(notionImportProperties),

	// scenes: defineEnt(sceneProperties).index("by_room", ["roomId"]),

	// characterAspectSkills: defineEnt({
	// 	...characterAspectSkillProperties,
	// }).edge("character", { field: "characterId" }),
})
