import { dedent } from "ts-dedent"
import {
	type Attribute,
	IntellectAttribute,
	MobilityAttribute,
	SenseAttribute,
	StrengthAttribute,
	WitAttribute,
} from "./attributes.ts"

export type Aspect = {
	name: string
	description: string
	attribute: Attribute
	ability: {
		name: string
		description: string
	}
}

export const FireAspect: Aspect = {
	name: "Fire",
	attribute: StrengthAttribute,
	description: dedent`
		Fire is the aspect of blind fury and relentless destruction. The end of dealing huge bursts of damage comes with the cost of taking chunks of that damage yourself.

		Some are more careful with the way they use it, others less so, glad to take the not-so-small tax of a dozen burns to reduce the opposition to a crisp.
	`,
	ability: {
		name: "Make Flame",
		description: `You can create fires that float over the palms of your hands. When doing so, take one damage for every soccer ball size of the flame beyond the first. Close your hand to extinguish the flame.`,
	},
}

export const WaterAspect: Aspect = {
	name: "Water",
	attribute: SenseAttribute,
	description: dedent`
		Water, ice, and mist all have great utility in everyday life, as well as more active scenarios like combat.

		Water is best used defensively: creating barriers, obstacles, and smoke screens to make things harder for their enemies, or building bridges for their allies.

		However, as evidenced by floods, tsunamis, typhoons, and other natural disasters, the indiscriminate nature of water requires great thought and care into where and how it's used.
	`,
	ability: {
		name: "Shape Water",
		description: `You can move, reform, and/or propel a mass of water, taking one fatigue for each eisenkind-mass of the water beyond the first.`,
	},
}

export const WindAspect: Aspect = {
	name: "Wind",
	attribute: MobilityAttribute,
	description: dedent``,
	ability: {
		name: "",
		description: "",
	},
}

export const LightAspect: Aspect = {
	name: "Light",
	attribute: IntellectAttribute,
	description: dedent``,
	ability: {
		name: "",
		description: "",
	},
}

export const DarknessAspect: Aspect = {
	name: "Darkness",
	attribute: WitAttribute,
	description: dedent``,
	ability: {
		name: "",
		description: "",
	},
}

export const Aspects = [FireAspect, WaterAspect, WindAspect, LightAspect, DarknessAspect]
