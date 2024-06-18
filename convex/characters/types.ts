import { brandedString, deprecated, literals, nullable } from "convex-helpers/validators"
import { v, type Infer } from "convex/values"
import { listAspectSkillIds } from "../../app/modules/aspect-skills/data.ts"
import { listAspectNames } from "../../app/modules/aspects/data.ts"
import { listAttributeIds } from "../../app/modules/attributes/data.ts"
import { listRaceIds } from "../../app/modules/races/data.ts"
import { nullish } from "../helpers/convex.ts"
import { userColorValidator } from "../types.ts"

export const characterAttributeValidator = literals(...listAttributeIds())

export const characterProperties = {
	// profile
	name: v.optional(v.string()),
	pronouns: v.optional(v.string()),
	imageId: v.optional(v.union(v.id("_storage"), v.null())),
	race: nullish(literals(...listRaceIds())),

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
				aspectId: literals(...listAspectNames()),
				aspectSkillIds: v.array(literals(...listAspectSkillIds())),
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
