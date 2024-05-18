import { brandedString, deprecated, nullable } from "convex-helpers/validators"
import { v } from "convex/values"

export const characterProperties = {
	// profile
	name: v.optional(v.string()),
	pronouns: v.optional(v.string()),
	imageId: v.optional(v.union(v.id("_storage"), v.null())),
	race: v.optional(v.string()),

	// stats
	strength: v.optional(v.number()),
	sense: v.optional(v.number()),
	mobility: v.optional(v.number()),
	intellect: v.optional(v.number()),
	wit: v.optional(v.number()),
	damageThreshold: v.optional(nullable(v.number())),
	fatigueThreshold: v.optional(nullable(v.number())),
	learnedAspectSkills: v.optional(
		// keep track of the order of aspects to calculate the correct EXP costs
		v.array(
			v.object({
				aspectId: v.string(),
				aspectSkillIds: v.array(v.string()),
			}),
		),
	),

	// status
	damage: v.optional(v.number()),
	fatigue: v.optional(v.number()),
	currency: v.optional(v.number()),

	// notes
	ownerNotes: v.optional(v.string()),
	playerNotes: v.optional(v.string()),

	// visibility
	visible: v.optional(v.boolean()),
	nameVisible: v.optional(v.boolean()),
	playerId: v.optional(nullable(brandedString("clerkId"))),

	// deprecated
	token: deprecated,
	coreAspect: v.optional(nullable(v.string())),
	aspectSkills: v.optional(v.array(v.string())),
}
