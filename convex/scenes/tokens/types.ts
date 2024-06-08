import { brandedString, literals } from "convex-helpers/validators"
import { v } from "convex/values"

export const sceneTokenProperties = {
	key: brandedString("token"),
	position: v.object({ x: v.number(), y: v.number() }),
	visible: v.boolean(),

	characterId: v.optional(v.id("characters")),

	// unique tokens use their own stress values instead of the character's
	unique: v.optional(v.boolean()),
	damage: v.optional(v.number()),
	fatigue: v.optional(v.number()),

	area: v.optional(
		v.object({
			width: v.number(),
			height: v.number(),
			color: literals("red", "orange", "yellow", "green", "blue", "purple"),
		}),
	),
}
