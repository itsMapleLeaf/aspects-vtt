import { keys } from "../app/common/object.ts"
import { titleCase } from "../app/common/string.ts"
import { getAspect, type Aspect } from "./aspects.ts"

const aspectSkillData = {
	// fire
	heatObject: { aspect: "fire", tier: 1, description: `Touch an object to send heat through it.` },
	heatAir: { aspect: "fire", tier: 1, description: `Heat up the surrounding air.` },
	propelFire: {
		aspect: "fire",
		tier: 1,
		description: `Turn an existing flame into a projectile which ignites on impact.`,
	},

	propelLightning: {
		aspect: "fire",
		tier: 2,
		description: `Take lightning or electricity and redirect it someplace else.`,
	},
	makeLightning: {
		aspect: "fire",
		tier: 2,
		description: `Create a sphere of fire in your palm, enough to power or short-circuit small or medium size devices.`,
	},
	makeFlame: {
		aspect: "fire",
		tier: 2,
		description: `Create a fire in your palm around the size of a baseball.`,
	},
	becomeFlame: {
		aspect: "fire",
		tier: 2,
		description: `Engulf yourself in a bright crackling ember. While in this state, double all damage dealt and all damage received.`,
	},

	fireResistance: {
		aspect: "fire",
		tier: 3,
		description: `You are less likely to be damaged by fire.`,
	},
	lightningResistance: {
		aspect: "fire",
		tier: 3,
		description: `Lightning has a chance to fizzle or reflect on contact.`,
	},
	suppress: {
		aspect: "fire",
		tier: 3,
		description: `Immediately extinguish any number of exposed fires.`,
	},
	insulate: {
		aspect: "fire",
		tier: 3,
		description: `Cancel the flow of electricity in the surrounding air or in an object.`,
	},

	sparkObject: {
		aspect: "fire",
		tier: 4,
		description: `Touch an object to send electricity through it.`,
	},
	sparkAir: { aspect: "fire", tier: 4, description: `Lightly electrify the air around you.` },
	quake: {
		aspect: "fire",
		tier: 4,
		description: `Stomp the ground to create a straight line of molten cracks through the ground.`,
	},
	ignite: { aspect: "fire", tier: 4, description: `Set fire to a nearby surface. ` },

	fireball: {
		aspect: "fire",
		tier: 5,
		description: `Create and propel a large ball of fire that bursts on impact.`,
	},
	arcOfFlame: {
		aspect: "fire",
		tier: 5,
		description: `Swipe your hand or foot to create a massive arc of flame in front of yourself.`,
	},
	cinderStorm: { aspect: "fire", tier: 5, description: `Summon a storm of raining fireballs.` },
	lightningStorm: {
		aspect: "fire",
		tier: 5,
		description: `Summon lightning to strike several areas.`,
	},

	// water
	frostTouch: {
		aspect: "water",
		tier: 1,
		description: `Touch a surface to send cooling through it.`,
	},
	cooling: { aspect: "water", tier: 1, description: `Lower the temperature of surrounding air.` },
	moisten: { aspect: "water", tier: 1, description: `Modify the humidity of surrounding air.` },

	shapeWater: {
		aspect: "water",
		tier: 2,
		description: `Move, shape, or propel gatherings of water.`,
	},
	shapeIce: { aspect: "water", tier: 2, description: `Move, break, or reform chunks of ice.` },

	condensate: {
		aspect: "water",
		tier: 3,
		description: `Gather and collect moisture in the surrounding air into water.`,
	},
	rapidMelt: { aspect: "water", tier: 3, description: `Rapidly turn ice into water.` },
	flashFreeze: { aspect: "water", tier: 3, description: `Rapidly turn bodies of water into ice.` },
	solidify: { aspect: "water", tier: 3, description: `Rapidly turn air moisture into ice.` },
	evaporate: { aspect: "water", tier: 3, description: `Rapidly evaporate bodies of water.` },
	vaporize: { aspect: "water", tier: 3, description: `Rapidly turn ice into air moisture.` },

	whispersOfTheMist: {
		aspect: "water",
		tier: 4,
		description: `Increase awareness of object through surrounding air moisture.`,
	},
	whispersOfTheSea: {
		aspect: "water",
		tier: 4,
		description: `Increase awareness of object through bodies of water.`,
	},
	whispersOfFrost: {
		aspect: "water",
		tier: 4,
		description: `Increase awareness of object through vibrations of ice.`,
	},

	ensnareWater: {
		aspect: "water",
		tier: 5,
		description: `When learning this skill, choose any liquid. You can control it as if it were water. You may learn this skill multiple times with different choices.`,
	},

	// wind
	formOfAFeather: {
		aspect: "wind",
		tier: 1,
		description: `Move as if under reduced gravity. Fall slowly, jump higher, and perform eased acrobatics.`,
	},

	gust: {
		aspect: "wind",
		tier: 2,
		description: `Create variable-strength haphazard gusts of wind to apply sudden impulses to objects and yourself.`,
	},
	breeze: {
		aspect: "wind",
		tier: 2,
		description: `Increase the wind speed around you to apply sustained forces to objects and yourself. This can allow you to fly.`,
	},
	dampenWind: {
		aspect: "wind",
		tier: 2,
		description: `Decrease or completely cancel the surrounding flow of wind.`,
	},

	shapeWind: {
		aspect: "wind",
		tier: 3,
		description: `Choose a shape when learning this skill, such as a sphere, walls, spikes, or blades. Morph wind into that shape and control its movement. You may learn this skill multiple times with different choices.`,
	},
	modulate: {
		aspect: "wind",
		tier: 3,
		description: `Control the volume and propagation of sound in the surrounding area.`,
	},
	integrate: {
		aspect: "wind",
		tier: 3,
		description: `Change the weather conditions of the surrounding environment.`,
	},

	condenseAir: {
		aspect: "wind",
		tier: 4,
		description: `Thicken the density of surrounding air, applying more apparent pressure to those within.`,
	},
	disperse: {
		aspect: "wind",
		tier: 4,
		description: `Decrease the density of surrounding air to a vacuum, depriving subjects within of breathing air.`,
	},
	alterSound: {
		aspect: "wind",
		tier: 4,
		description: `Control the volume and propagation of sound in the surrounding area.`,
	},

	alterAtmosphere: {
		aspect: "wind",
		tier: 5,
		description: `Change the weather conditions of the surrounding environment.`,
	},
	foresee: {
		aspect: "wind",
		tier: 5,
		description: `Become one with the surrounding environment to predict changing weather conditions in the future.`,
	},

	// light
	summonLight: {
		aspect: "light",
		tier: 1,
		description: `Create and control floating orbs of light.`,
	},
	illuminatingTouch: {
		aspect: "light",
		tier: 1,
		description: `Touch an object, person, or surface to give them a warming glow. Focusing to maintain.`,
	},

	healingLight: {
		aspect: "light",
		tier: 2,
		description: `Touch a character to heal their damage.`,
	},
	comfortingLight: {
		aspect: "light",
		tier: 2,
		description: `Touch a character to heal their fatigue.`,
	},
	strengtheningLight: {
		aspect: "light",
		tier: 2,
		description: `Touch a character to strengthen them and temporarily increase the power of their actions.`,
	},

	barrier: { aspect: "light", tier: 3, description: `Conjure large walls of solidified light.` },
	rayOfProtection: {
		aspect: "light",
		tier: 3,
		description: `Touch a target to surround them with a shield of light that protects them from damaging threats. Focus to maintain.`,
	},
	rayOfJustice: {
		aspect: "light",
		tier: 3,
		description: `Conjure and direct sharp spears of light towards one or more targets of your choosing.`,
	},

	discernReality: {
		aspect: "light",
		tier: 4,
		description: `See everything around you as it is, unaffected by mirages, invisibility, faces, and other forms of light and perception-altering illusions.`,
	},
	pierceReality: {
		aspect: "light",
		tier: 4,
		description: `See through walls and other solid objects.`,
	},

	healingAura: {
		aspect: "light",
		tier: 5,
		description: `Emit a warming glow to heal damage from surrounding characters.`,
	},
	comfortingAura: {
		aspect: "light",
		tier: 5,
		description: `Emit a comforting glow to heal fatigue from surrounding characters.`,
	},
	strengtheningAura: {
		aspect: "light",
		tier: 5,
		description: `Emit an uplifting glow to strengthen surrounding characters.`,
	},

	// darkness
	intimidate: {
		aspect: "darkness",
		tier: 1,
		description: `Induce feelings of dread in a character you can see.`,
	},
	charm: {
		aspect: "darkness",
		tier: 1,
		description: `Induce feelings of favor or attraction in a character you can see, towards yourself or another character.`,
	},
	spotlight: {
		aspect: "darkness",
		tier: 1,
		description: `Increase your presence or that of another nearby character, such that it’s much harder to overlook you.`,
	},
	sneak: {
		aspect: "darkness",
		tier: 1,
		description: `Lower your presence or that of another nearby character, such that others are less likely to notice you.`,
	},

	auraOfWeakness: {
		aspect: "darkness",
		tier: 2,
		description: `Take on a dark, overpowering glow that physically weakens those nearby.`,
	},
	auraOfSickness: {
		aspect: "darkness",
		tier: 2,
		description: `Take on a dark, foreboding glow that mentally weakens those nearby.`,
	},

	invisibility: {
		aspect: "darkness",
		tier: 3,
		description: `Turn invisible, such that visible light passes through you.`,
	},
	disguise: {
		aspect: "darkness",
		tier: 3,
		description: `Change the outward appearance of a character or object you can see.`,
	},
	facade: {
		aspect: "darkness",
		tier: 3,
		description: `Create identical but untouchable mirror images of a character or object you can see.`,
	},

	alterEmotion: {
		aspect: "darkness",
		tier: 4,
		description: `Choose an emotion when learning this skill. Touch a character to change the strength of that emotion in them. You may learn this skill multiple times with different choices.`,
	},
	alterSenses: {
		aspect: "darkness",
		tier: 4,
		description: `Choose a sense when learning this skill. Amplify or dampen that sense of a person you can touch. You may learn this skill multiple times with different choices.`,
	},
	alterMemories: {
		aspect: "darkness",
		tier: 4,
		description: `Change the memories of a character you can touch.`,
	},

	phase: { aspect: "darkness", tier: 5, description: `Float and phase through solid objects.` },
	riftwalk: {
		aspect: "darkness",
		tier: 5,
		description: `Create tears in reality to move from one place to another visible location.`,
	},
} satisfies Record<string, { aspect: Aspect["id"]; tier: number; description: string }>

const tierNamesByAspect = {
	fire: ["Alter", "Create", "Control", "Imbue", "Summon"],
	water: ["Alter", "Reform", "Transform", "Sense", "Detect"],
	wind: ["Coincide", "Direct", "Shape", "Modulate", "Integrate"],
	light: ["Illuminate", "Restore", "Bless", "Protect", "Perceive"],
	darkness: ["Influence", "Curse", "Deceive", "Rewrite", "Dematerialize"],
} as const satisfies Record<Aspect["id"], readonly string[]>

export interface AspectSkillTier {
	name: string
	number: number
}

export interface AspectSkill {
	readonly id: keyof typeof aspectSkillData
	readonly name: string
	readonly description: string
	readonly aspect: Aspect
	readonly tier: AspectSkillTier
}

export function getAspectSkill(id: AspectSkill["id"]): AspectSkill {
	const { tier, description, aspect } = aspectSkillData[id]
	return {
		id,
		name: titleCase(id),
		description,
		tier: { number: tier, name: tierNamesByAspect[aspect][0] },
		aspect: getAspect(aspect),
	}
}

export function listAspectSkillIds() {
	return keys(aspectSkillData)
}

export function listAspectSkills() {
	return listAspectSkillIds().map(getAspectSkill)
}

export function listAspectSkillsByAspect(aspectId: Aspect["id"]) {
	return listAspectSkills().filter((skill) => skill.aspect.id === aspectId)
}

export function listAspectSkillsByTier(aspectId: Aspect["id"], tierNumber: number) {
	return listAspectSkills().filter(
		(skill) => skill.aspect.id === aspectId && skill.tier.number === tierNumber,
	)
}

export function listAspectSkillTiers(aspectId: Aspect["id"]): Iterator<AspectSkillTier> {
	return Iterator.from(tierNamesByAspect[aspectId]).map((name, index) => ({
		name,
		number: index + 1,
	}))
}
