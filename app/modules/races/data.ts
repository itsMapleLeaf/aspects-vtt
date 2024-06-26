import { SafeMap, type SafeMapValue } from "../../helpers/SafeMap.ts"
import { titleCase } from "../../helpers/string.ts"

export const Races = SafeMap.mapRecord(
	{
		Aquilian: {
			abilities: {
				"Flight": "In combat, spend 1 resolve to stay airborne until the start of your next turn.",
				"One with the Wind": "You are immune to damage from Wind.",
			},
		},
		Arctana: {
			abilities: {
				"Natural Intellect": "Your @Intellect rolls have +1 boost die.",
				"Resourceful": "You have one extra action point.",
			},
		},
		Cetacian: {
			abilities: {
				"Aquatic Affinity":
					"In combat, spend one resolve to double your movement speed underwater for the turn.",
				"Sensory Superiority": "Your Sense rolls have +1 boost die",
			},
		},
		Felirian: {
			abilities: {
				Slippery: "You have +1 boost die when using Dodge.",
				Restful: "You have +1 boost die when resting.",
			},
		},
		Lagorei: {
			abilities: {
				"Unwavering Kick":
					"You can only use your feet for Strike actions, and you roll with +1 boost die.",
				"Leap of Confidence":
					"Spend 1 resolve to leap: double your movement, you are in the air while moving, and you can only move in a straight line.",
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
				"Spelunker": "Spend 1 resolve to burrow through dirt and double your movement.",
				"Claws": "All strike rolls have +1 boost dice.",
				"Protective Scales": "Your max health is increased by 10.",
			},
			healthBonus: 10,
		},
		Pyra: {
			abilities: {
				"Tail Whip":
					"Use your tail to knock nearby characters prone. They lose their remaining actions.",
				"Descendant of the Caldera": "You are immune to damage from fire and heat.",
			},
		},
		Renari: {
			abilities: {
				"Sneak Attack":
					"In combat, when attacking an enemy who hasn’t taken their turn yet, double your attack roll.",
				"Adaptable":
					"Before the start of combat, you may swap two of your attribute dice until the end of combat.",
			},
		},
		Sylvanix: {
			abilities: {
				Resolute: "Your max resolve is increased by 10.",
				Nimble: "Your Mobility rolls have +1 boost die.",
			},
			resolveBonus: 10,
		},
		Umbraleth: {
			abilities: {
				"Devilish Charm": "Your Wit rolls have +1 boost die.",
				"Descendant of Darkness": "All of your attribute rolls have +1 boost dice at night.",
			},
		},
	},
	(entry, id) => ({
		id,
		name: titleCase(id),
		abilities: entry.abilities,
		healthBonus: "healthBonus" in entry ? entry.healthBonus : 0,
		resolveBonus: "resolveBonus" in entry ? entry.resolveBonus : 0,
	}),
)

export type Race = SafeMapValue<typeof Races>

export const getRace = Races.get.bind(Races)
export const listRaces = Races.values.bind(Races)
export const listRaceIds = Races.keys.bind(Races)
