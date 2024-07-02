export interface Action {
	name: string
	description: string
	notes: string
}

export const actions: Action[] = [
	{
		name: "Block",
		description: `Before taking damage from an attack, roll Strength and reduce it by the result, to no less than 1.`,
		notes: `This can only be used as a reaction.`,
	},
	{
		name: "Climb",
		description: `Scale a wall or very steep surface.`,
		notes: `The height must be equal or less than meters equal to the power of the character's Mobility.`,
	},
	{
		name: "Dodge",
		description: `Before taking damage from an attack, roll Mobility. If rolling higher than the damage amount, avoid all damage.`,
		notes: `This can only be used as a reaction.`,
	},
	{
		name: "Jump",
		description: `Jump to a place that wouldn't be accessible via walking.`,
		notes: `The distance must be equal or less than meters equal to the power of the character's Mobility.`,
	},
	{
		name: "Rest",
		description: `Choose a number of hours to rest. Gain that many points of resolve.`,
		notes: `You cannot make any actions or move from your present location/scene while resting. Downtime can still be roleplayed out.`,
	},
	{
		name: "Restrain",
		description: `Prevent a nearby character from moving while you are beside them.`,
		notes: `The other character must use an action to break free. If your Strength's power is greater than theirs, they must roll Strength equal or higher to your Strength's power to break free. You may release them with a minor action.`,
	},
	{
		name: "Shoot",
		description: `Aim and fire a projectile-based weapon. Roll Sense. To hit, the result must be equal or higher than the target's distance in meters.`,
		notes: `If made as an attack, the Sense roll is also your attack roll.`,
	},
	{
		name: "Sneak",
		description: `Make yourself harder to detect.`,
		notes: `For other characters that are within meters equal or lesser than their Sense, they can roll Sense, and they'll detect you if they roll higher than your Mobility's power.`,
	},
	{
		name: "Strike",
		description: `Make a physical attack against a nearby character, either using your fists, feet, or an object.`,
		notes: ``,
	},
	{
		name: "Throw",
		description: `Pick up an object and throw it.`,
		notes: `Depending on the character's Strength, heaver objects should require more action points.`,
	},
]
