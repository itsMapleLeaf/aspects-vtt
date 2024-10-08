import { SafeMap, type SafeMapValue } from "../../../common/SafeMap.ts"
import { titleCase } from "../../../common/string.ts"

export const GeneralSkills = SafeMap.mapRecord(
	{
		dash: {
			description: `Roll Mobility and add that to your movement amount this turn.`,
		},
		defend: {
			description: `You can only use this as a reaction. The next time you take damage, roll Strength and reduce it by that amount to no less than 1.`,
		},
		dodge: {
			description: `You may only use this as a reaction.

Before you take damage, roll Mobility. If the effect is higher than the damage amount, prevent all damage. If necessary, you must make a movement out of the damage area.`,
		},
		focus: {
			description: `Your next attribute roll has +1 boost die.`,
		},
		intimidate: {
			description: `Choose a visible target within 5 meters. Roll Wit.

The target must make an equal or higher Sense or Wit roll. If they fail, they take 1d4 fatigue and cannot approach or target you until the start of your next turn.`,
		},
		rest: {
			description: `Rest for a number of hours, roll that many d4 dice, and heal fatigue equal to the effect. You cannot make any actions while resting.`,
		},
		restrain: {
			description: `Choose a nearby character. Roll Strength. If the effect meets or exceeds their mobility value, occupy their area.

They cannot move until you use an action to release them, leave their area, or until they use an action to win a contested strength roll against you.`,
		},
		strike: {
			description: `Choose a die no higher than your strength. Roll that die twice and deal damage equal to the total to a nearby character.`,
		},
		taunt: {
			description: `Target a visible character no more than 20 meters away. Roll Wit. If the effect meets or exceeds the character’s Wit or Intellect (the higher of the two), their next targeted action must target you.`,
		},
	},
	({ description }, id) => ({
		id,
		name: titleCase(id),
		description,
	}),
)

export type GeneralSkill = SafeMapValue<typeof GeneralSkills>

export const getGeneralSkill = GeneralSkills.get.bind(GeneralSkills)
export const listGeneralSkills = GeneralSkills.values.bind(GeneralSkills)
export const listGeneralSkillIds = GeneralSkills.keys.bind(GeneralSkills)
