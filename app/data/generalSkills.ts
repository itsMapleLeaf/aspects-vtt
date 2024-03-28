export type GeneralSkill = {
	name: string
	description: string
	attribute: "sense" | "mobility" | "strength" | "intellect" | "wit"
}

export const generalSkills: GeneralSkill[] = [
	{
		name: "Defend",
		description: `The next time you take damage, reduce it by the effect to no less than 1.`,
		attribute: "strength",
	},
	{
		name: "Aquatic Healing",
		description: `Make use of a visible water source to heal a nearby character’s damage by the effect. Take one fatigue for every use of that water source beyond the first.`,
		attribute: "sense",
	},
	{
		name: "Strike",
		description: `Make a melee attack against a nearby target and deal damage equal to the effect.\n\nThe target may roll Strength and reduce the damage down to 1, or they may roll Mobility and avoid all damage if the roll is higher (**not** equal!).`,
		attribute: "strength",
	},
	{
		name: "Illuminated Healing",
		description: `Heal a nearby character's damage by the effect, then take 1 fatigue.`,
		attribute: "intellect",
	},
	{
		name: "Dash",
		description: `Double your movement until the start of your next turn.`,
		attribute: "mobility",
	},
	{
		name: "Focus",
		description: `Your next roll ignores snag dice.`,
		attribute: "sense",
	},
]
generalSkills.sort((a, b) => a.name.localeCompare(b.name))
