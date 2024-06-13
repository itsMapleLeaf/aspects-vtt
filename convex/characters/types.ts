import { brandedString, deprecated, literals, nullable } from "convex-helpers/validators"
import { v, type Infer } from "convex/values"
import { userColorValidator } from "../types.ts"

export const characterAttributeValidator = literals(
	"strength",
	"sense",
	"mobility",
	"intellect",
	"wit",
)

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
	damageThresholdDelta: v.optional(v.number()),
	fatigueThresholdDelta: v.optional(v.number()),
	learnedAspectSkills: v.optional(
		// keep track of the order of aspects to calculate the correct EXP costs
		v.array(
			v.object({
				aspectId: v.string(),
				aspectSkillIds: v.array(v.string()),
			}),
		),
	),
	modifiers: v.optional(
		v.array(
			v.object({
				attribute: characterAttributeValidator,
				boostDice: v.number(),
				snagDice: v.number(),
				attributeDice: v.number(),
			}),
		),
	),

	// status
	damage: v.optional(v.number()),
	fatigue: v.optional(v.number()),
	currency: v.optional(v.number()),
	conditions: v.optional(v.array(characterConditionValidator())),

	// notes
	ownerNotes: v.optional(v.string()),
	playerNotes: v.optional(v.string()),

	// visibility
	visible: v.optional(v.boolean()),
	nameVisible: v.optional(v.boolean()),
	playerId: v.optional(nullable(brandedString("clerkId"))),

	// deprecated
	token: deprecated,
	coreAspect: deprecated,
	aspectSkills: deprecated,
	damageThreshold: deprecated,
	fatigueThreshold: deprecated,
}

function characterConditionValidator() {
	return v.object({
		name: v.string(),
		color: userColorValidator(),
	})
}
export type ApiCharacterCondition = Infer<ReturnType<typeof characterConditionValidator>>
