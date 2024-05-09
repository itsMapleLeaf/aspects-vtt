import { deprecated } from "convex-helpers/validators"
import { v } from "convex/values"

export const roomProperties = {
	name: v.optional(v.string()),
	experience: v.optional(v.number()),
	currentScene: v.optional(v.id("scenes")),
	gameTime: v.optional(v.number()), // measured in days since the start of year 0

	mapImageId: deprecated,
	mapDimensions: deprecated,
	mapCellSize: deprecated,
}
