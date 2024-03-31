import type { PickByValue } from "#app/common/types.js"
import type { Doc } from "#convex/_generated/dataModel.js"

export type Attribute = {
	name: string
	description: string
	key: keyof PickByValue<Doc<"characters">, number>
}

export const StrengthAttribute: Attribute = {
	name: "Strength",
	key: "strength",
	description: `The physical power of a character. Used for breaking things, lifting things, and hitting things.`,
}

export const SenseAttribute: Attribute = {
	name: "Sense",
	key: "sense",
	description: `The ability to perceive the world around you. Used for noticing things, dodging attacks, and aiming.`,
}

export const MobilityAttribute: Attribute = {
	name: "Mobility",
	key: "mobility",
	description: `The ability to move around. Used for running, jumping, and climbing.`,
}

export const IntellectAttribute: Attribute = {
	name: "Intellect",
	key: "intellect",
	description: `The ability to think and reason. Used for solving puzzles, remembering things, and understanding complex concepts.`,
}

export const WitAttribute: Attribute = {
	name: "Wit",
	key: "wit",
	description: `The ability to think on your feet. Used for charming, lying, persuading, and inferring the thoughts and feelings of others.`,
}

export const Attributes = [
	StrengthAttribute,
	SenseAttribute,
	MobilityAttribute,
	IntellectAttribute,
	WitAttribute,
]
