import { Brand } from "effect"
import { mapValues } from "~/helpers/object.ts"
import { titleCase } from "~/helpers/string.ts"

export interface RaceInput {
	abilities: Record<string, { description: string }>
	healthBonus?: number
	resolveBonus?: number
}

const inputs: Record<string, RaceInput> = {
	Aquilian: {
		abilities: {
			flight: {
				description: `In combat, spend 1 resolve to stay airborne until the start of your next turn.`,
			},
			oneWithTheWind: {
				description: `You are immune to damage from Wind.`,
			},
		},
	},
	Arctana: {
		abilities: {
			naturalIntellect: {
				description: `Your @Intellect rolls have +1 boost die.`,
			},
			resourceful: {
				description: `You have one extra action point.`,
			},
		},
	},
	Cetacian: {
		abilities: {
			aquaticAffinity: {
				description: `In combat, spend one resolve to double your movement speed underwater for the turn.`,
			},
			sensorySuperiority: {
				description: `Your Sense rolls have +1 boost die`,
			},
		},
	},
	Felirian: {
		abilities: {
			slippery: {
				description: `You have +1 boost die when using Dodge.`,
			},
			restful: {
				description: `You have +1 boost die when resting.`,
			},
		},
	},
	Lagorei: {
		abilities: {
			unwaveringKick: {
				description: `You can only use your feet for Strike actions, and you roll with +1 boost die.`,
			},
			leapOfConfidence: {
				description: `Spend 1 resolve to leap: double your movement, you are in the air while moving, and you can only move in a straight line.`,
			},
		},
	},
	Marenti: {
		abilities: {
			quietAsAMouse: {
				description: `You don’t make noise while moving.`,
			},
			naturallyStealthy: {
				description: `Characters roll with +1 snag die when trying to notice you.`,
			},
		},
	},
	Myrmadon: {
		abilities: {
			spelunker: {
				description: `Spend 1 resolve to burrow through dirt and double your movement.`,
			},
			claws: {
				description: `All strike rolls have +1 boost dice.`,
			},
			protectiveScales: {
				description: `Your max health is increased by 10.`,
			},
		},
		healthBonus: 10,
	},
	Pyra: {
		abilities: {
			tailWhip: {
				description: `Use your tail to knock nearby characters prone. They lose their remaining actions.`,
			},
			descendantOfTheCaldera: {
				description: `You are immune to damage from fire and heat.`,
			},
		},
	},
	Renari: {
		abilities: {
			sneakAttack: {
				description: `In combat, when attacking an enemy who hasn’t taken their turn yet, double your attack roll.`,
			},
			adaptable: {
				description: `Before the start of combat, you may swap two of your attribute dice until the end of combat.`,
			},
		},
	},
	Sylvanix: {
		abilities: {
			resolute: {
				description: `Your max resolve is increased by 10.`,
			},
			nimble: {
				description: `Your Mobility rolls have +1 boost die.`,
			},
		},
		resolveBonus: 10,
	},
	Umbraleth: {
		abilities: {
			devilishCharm: {
				description: `Your Wit rolls have +1 boost die.`,
			},
			descendantOfDarkness: {
				description: `All of your attribute rolls have +1 boost dice at night.`,
			},
		},
	},
}

export type RaceId = string & Brand.Brand<"RaceId">
export const RaceId = Brand.nominal<RaceId>()

export interface Race {
	readonly id: RaceId
	readonly name: string
	readonly abilities: Record<string, RaceAbility>
	readonly healthBonus: number
	readonly resolveBonus: number
}

export interface RaceAbility {
	id: string
	name: string
	description: string
}

export function getRace(id: RaceId): Race | undefined {
	const input = inputs[id]
	if (!input) return

	return {
		id,
		name: titleCase(id),
		abilities: mapValues(input.abilities, ({ description }, id) => ({
			id,
			name: titleCase(id),
			description,
		})),
		healthBonus: input.healthBonus ?? 0,
		resolveBonus: input.resolveBonus ?? 0,
	}
}

export function listRaceIds() {
	return Object.keys(inputs) as RaceId[]
}

export function listRaces() {
	return listRaceIds().map(getRace).filter(Boolean)
}
