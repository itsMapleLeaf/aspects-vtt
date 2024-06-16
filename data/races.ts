import { keys } from "../app/common/object.ts"
import { titleCase } from "../app/common/string.ts"

const races = {
	Aquilian: {
		abilities: {
			"Flight": "Your movement speed is doubled while in the air.",
			"One with the Wind": "You are immune to damage from Wind.",
		},
	},
	Arctana: {
		abilities: {
			"Oddly Approachable": "Other characters’ Wit rolls against you have +1 snag die.",
			"Natural Intellect": "Your Intellect rolls have +1 boost die.",
		},
	},
	Cetacian: {
		abilities: {
			"Aquatic Affinity": "Your movement speed is doubled while swimming.",
			"Sensory Superiority": "Your Sense rolls have +1 boost die",
		},
	},
	Felirian: {
		abilities: {
			Restful: "You may take 1 fatigue during a rest.",
			Slippery: "You may roll an extra die when using @Dodge.",
		},
	},
	Lagorei: {
		abilities: {
			"Unwavering Kick":
				"You can only use your feet for Strike actions, and you roll with +1 boost die.",
			"Leap of Confidence":
				"When using Dash, you always roll with an additional attribute die, you are in the air while moving, and you can only move in a straight line.",
		},
	},
	Marenti: {
		abilities: {
			"Quiet as a Mouse": "You don’t make noise while moving.",
			"Naturally Stealthy": "Characters roll with +1 snag die when trying to notice you.",
		},
	},
	Myrmadon: {
		abilities: {
			"Spelunker": "When using Dash, you may burrow through dirt to roll with an extra die.",
			"Claws": "All strike rolls have +1 boost dice.",
			"Protective Scales": "Your damage threshold is increased by 10.",
		},
	},
	Pyra: {
		abilities: {
			"Tail Whip":
				"Use your tail to knock nearby characters prone. They take 1d4 damage. Until the start of their turn, their physical rolls have +1 snag die.",
			"Caldera": "You are immune to damage from fire and heat.",
		},
	},
	Renari: {
		abilities: {
			"Sneak Attack":
				"In combat, when targeting an enemy who hasn’t taken their turn yet, roll with an extra attribute die.",
			"Adaptable":
				"Before the start of combat, you may swap two of your attribute dice until the end of combat.",
		},
	},
	Sylvanix: {
		abilities: {
			Resolute: "Your fatigue threshold is increased by 10.",
			Nimble: "Your Mobility rolls have +1 boost die.",
		},
	},
} satisfies Record<string, { abilities: Record<string, string> }>

export interface Race {
	readonly id: keyof typeof races
	readonly name: string
	readonly abilities: Record<string, string>
}

export function getRace(id: Race["id"]): Race {
	return {
		id,
		name: titleCase(id),
		abilities: races[id].abilities,
	}
}

export function getRaces() {
	return keys(races).map(getRace)
}

export function getRaceNames() {
	return keys(races)
}
