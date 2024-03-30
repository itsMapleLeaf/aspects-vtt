export type Race = {
	name: string
	// emoji: string
	abilities: RaceAbility[]
}

export type RaceAbility = {
	name: string
	description: string
}

export const races: Race[] = [
	{
		name: "Aquilian",
		abilities: [
			{
				name: "Flight",
				description: "Your movement speed is doubled while in the air.",
			},
			{
				name: "Aquilian Hivemind",
				description:
					"When in the presence of another aquilian,  your Sense rolls have +3 boost dice.",
			},
		],
	},
	{
		name: "Cetacian",
		abilities: [
			{
				name: "Azeuran Intellect",
				description: "Your intellect rolls have +3 boost dice.",
			},
			{
				name: "Aquatic Affinity",
				description: "Your movement speed is doubled while underwater.",
			},
		],
	},
	{
		name: "Felirian",
		abilities: [
			{
				name: "Right Side Up",
				description:
					"If you would take damage from a fall, you land perfectly on your feet, then roll your mobility die and reduce that much damage.",
			},
			{
				name: "Slippery",
				description:
					"When an enemy becomes adjacent to you, you may roll mobility and move that many meters away from them, then take 1 fatigue.",
			},
		],
	},
	{
		name: "Lagorei",
		abilities: [
			{
				name: "Unwavering Kick",
				description:
					"You can only use your feet for Strike actions. When you do, double your damage dealt.",
			},
			{
				name: "Leap of Confidence",
				description:
					"Leap when using Dash - you are in the air while moving, and you can only move in a straight line.",
			},
			{
				name: "Worldly Knowledge",
				description: "Rolls relating to nature have +3 boost dice.",
			},
		],
	},
	{
		name: "Marenti",
		abilities: [
			{
				name: "Flexibly Squishy",
				description: "Fit through tight spaces that are half as big as you wouldn't otherwise.",
			},
			{
				name: "Quiet as a Mouse",
				description: "You don't make noise while moving.",
			},
		],
	},
	{
		name: "Myrmadon",
		abilities: [
			{
				name: "Spelunker",
				description: "Doubled movement when burrowing through dirt.",
			},
			{
				name: "Claws",
				description: "All strike rolls have +3 boost dice.",
			},
			{
				name: "Protective Scales",
				description:
					"When taking damage, roll Strength and subtract that amount to no less than 1.",
			},
		],
	},
	{
		name: "Pyra",
		abilities: [
			{
				name: "Draconic Intimidation",
				description: "Characters' Wit rolls against you have +3 snag dice.",
			},
			{
				name: "Tail Whip",
				description:
					"Use your tail to knock adjacent characters prone. Until the start of their next turn, their rolls ignore boost dice.",
			},
		],
	},
	{
		name: "Renari",
		abilities: [
			{
				name: "Nimble",
				description: "Your Mobility rolls have +3 boost dice.",
			},
			{
				name: "Sharp Ears",
				description: "Rolls to hear have +3 boost dice.",
			},
			{
				name: "Frostbound",
				description: "Your rolls have +3 boost while in freezing cold environments.",
			},
		],
	},
	{
		name: "Sylvanix",
		abilities: [
			{
				name: "Stronger Together",
				description: "In the presence of other Sylvanix, double the effect of your sense rolls.",
			},
			{
				name: "Keen Eyes",
				description: "When rolling to look for something, you have +3 boost dice.",
			},
		],
	},
	{
		name: "Umbraleth",
		abilities: [
			{
				name: "Devilish Charm",
				description: "Your Wit rolls for charming or lying to others have +3 boost dice.",
			},
			{
				name: "Takes One to Know One",
				description:
					"Always know the presence of other umbraleth within a distance equal to your Sense plus your Wit.",
			},
		],
	},
]
