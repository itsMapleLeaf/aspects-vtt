import { deprecated } from "convex-helpers/validators"
import { v } from "convex/values"
import { vectorValidator } from "../types.ts"

export const roomProperties = {
	name: v.optional(v.string()),
	experience: v.optional(v.number()),
	currentScene: v.optional(v.id("scenes")),
	gameTime: v.optional(v.number()), // measured in days since the start of year 0
	ping: v.optional(
		v.object({
			key: v.optional(v.string()),
			name: v.string(),
			position: vectorValidator(),
			colorHue: v.number(),
		}),
	),

	mapImageId: deprecated,
	mapDimensions: deprecated,
	mapCellSize: deprecated,
}
