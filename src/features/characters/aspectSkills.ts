import { mapValues } from "lodash-es"
import { formatTitle } from "~/shared/string.ts"
import { Aspect } from "./aspects.ts"

type AspectSkillDefinition = {
	description: string
	aspectId: Aspect["id"]
	category: string
	price: number
}

// this ensures requirements can only point to valid keys
type RequirementGraph<Graph extends Record<string, AspectSkillDefinition>> = {
	[K in keyof Graph]: {
		requires: (keyof Graph)[]
	}
}

export interface AspectSkill extends AspectSkillDefinition {
	id: string
	name: string
	aspect: Aspect
	requires: readonly AspectSkill[]
}

function defineSkills<Graph extends Record<string, AspectSkillDefinition>>(
	skills: Graph & RequirementGraph<Graph>,
): Record<keyof Graph, AspectSkill> & Record<string, AspectSkill | undefined> {
	const mappedSkills = mapValues(skills, (skill, id) => {
		const mappedSkill: AspectSkill = {
			...skill,
			id,
			name: formatTitle(id),
			aspect: new Aspect(skill.aspectId),
			get requires() {
				return skill.requires.map((id) => mappedSkills[id])
			},
		}
		return mappedSkill
	})
	return mappedSkills
}

export const ASPECT_SKILLS = defineSkills({
	//#region Fire
	heating: {
		description: "Generate enough heat to boil water.",
		aspectId: "fire",
		category: "heat",
		price: 5,
		requires: [],
	},
	burning: {
		description: `Generate enough heat to ignite objects.
		In combat, targets take 1d4 damage on their turn while on fire.`,
		aspectId: "fire",
		category: "heat",
		price: 10,
		requires: ["heating"],
	},

	candlelight: {
		description: "Generate a small, controlled flame equivalent to a candle.",
		aspectId: "fire",
		category: "flame",
		price: 5,
		requires: ["burning"],
	},
	torchlight: {
		description: "Create a larger flame, similar to a torch.",
		aspectId: "fire",
		category: "flame",
		price: 10,
		requires: ["candlelight"],
	},
	fireball: {
		description: `Conjure and propel a ball of fire at a target.`,
		aspectId: "fire",
		category: "flame",
		price: 20,
		requires: ["torchlight"],
	},
	smolderingMight: {
		description: "Take 2 damage for +1 boost die to attack rolls, repeatable.",
		aspectId: "fire",
		category: "flame",
		price: 30,
		requires: ["torchlight"],
	},
	flamewall: {
		description: `Create a wall of fire for protection or offense.
		The wall must be in a straight line of length no higher than your strength's power in meters.
		When a target enters the wall, you may make a strength attack against them.`,
		aspectId: "fire",
		category: "flame",
		price: 50,
		requires: ["fireball"],
	},
	curseOfEmber: {
		description: `Ignite a target from a distance.
		On their turn, you may make a strength attack against them while they are on fire.`,
		aspectId: "fire",
		category: "flame",
		price: 50,
		requires: ["fireball"],
	},

	redirectLightning: {
		description: "Control the path of a stream of lightning.",
		aspectId: "fire",
		category: "lightning",
		price: 5,
		requires: [],
	},
	createLightning: {
		description: "Generate and control lightning bolts.",
		aspectId: "fire",
		category: "lightning",
		price: 20,
		requires: ["redirectLightning"],
	},
	lightningStorm: {
		description: `Attack a target with a lightning strike.
		Take 3 damage for each additional target.`,
		aspectId: "fire",
		category: "lightning",
		price: 40,
		requires: ["createLightning"],
	},

	shapeRock: {
		description: "Generate enough heat to melt rock into magma.",
		aspectId: "fire",
		category: "magma",
		price: 20,
		requires: ["burning"],
	},
	shapeMetal: {
		description: "Generate enough heat to melt metal.",
		aspectId: "fire",
		category: "magma",
		price: 30,
		requires: ["shapeRock"],
	},
	shapeMagma: {
		description: "Control and shape magma.",
		aspectId: "fire",
		category: "magma",
		price: 50,
		requires: ["shapeMetal"],
	},

	shatterEarth: {
		description: `Create fissures in the ground.
		The fissures form straight lines in all four cardinal directions, no longer than your strength's power in meters.
		Attack every affected target, and take 3 damage for each one.`,
		aspectId: "fire",
		category: "tectonic",
		price: 20,
		requires: ["burning"],
	},
	cinderStorm: {
		description: `Summon a devastating storm of cinders and ash.
		In an area no larger than your strength's power in meters, attack each target, and take 3 damage for each one.`,
		aspectId: "fire",
		category: "tectonic",
		price: 50,
		requires: ["shatterEarth"],
	},
	//#endregion

	//#region Water
	// touchProximity: {
	// 	description: "Manipulate water through direct contact.",
	// 	aspectId: "water",
	// 	category: "waterCore",
	// 	price: 0,
	// 	requires: [],
	// },
	// macroPrecision: {
	// 	description:
	// 		"Manipulate cohesive bodies of water, like puddles or buckets.",
	// 	aspectId: "water",
	// 	category: "waterCore",
	// 	price: 0,
	// 	requires: [],
	// },
	// pureWater: {
	// 	description: "Manipulate pure water.",
	// 	aspectId: "water",
	// 	category: "waterCore",
	// 	price: 0,
	// 	requires: [],
	// },
	// teacupVolume: {
	// 	description: "Manipulate water volumes up to the size of a teacup.",
	// 	aspectId: "water",
	// 	category: "waterCore",
	// 	price: 0,
	// 	requires: [],
	// },

	shapeWater: {
		description: `Control and shape liquid water.\nBy default, you may only control pure water through direct contact at the macroscopic level, in volumes no larger than a teacup.`,
		aspectId: "water",
		category: "shape",
		price: 10,
		requires: [],
	},
	shapeIce: {
		description: "Control, shape, and break ice.",
		aspectId: "water",
		category: "shape",
		price: 20,
		requires: ["shapeWater"],
	},
	shapeVapor: {
		description: "Control water vapor and create condensation.",
		aspectId: "water",
		category: "shape",
		price: 30,
		requires: ["shapeIce"],
	},

	visibleProximity: {
		description: "Manipulate water within visible range.",
		aspectId: "water",
		category: "proximity",
		price: 25,
		requires: ["shapeWater"],
	},
	nearbyProximity: {
		description:
			"Manipulate water in the nearby area, even if not directly visible.",
		aspectId: "water",
		category: "proximity",
		price: 50,
		requires: ["visibleProximity"],
	},

	frost: {
		description: "Create a thin layer of frost on surfaces.",
		aspectId: "water",
		category: "temperature",
		price: 5,
		requires: ["shapeWater"],
	},
	freezeWater: {
		description: "Transform liquid water into ice.",
		aspectId: "water",
		category: "temperature",
		price: 20,
		requires: ["frost"],
	},
	freezeAir: {
		description: "Create ice directly from water vapor in the air.",
		aspectId: "water",
		category: "temperature",
		price: 40,
		requires: ["freezeWater"],
	},

	whispersOfFrost: {
		description:
			"Sense the presence of other objects and characters through solid ice or frost.",
		aspectId: "water",
		category: "whispers",
		price: 10,
		requires: ["shapeWater"],
	},
	whispersOfWater: {
		description:
			"Sense the presence of other objects and characters through liquid water.",
		aspectId: "water",
		category: "whispers",
		price: 25,
		requires: ["shapeWater"],
	},
	whispersOfMist: {
		description:
			"Sense the presence of other objects and characters through the water in the air.",
		aspectId: "water",
		category: "whispers",
		price: 50,
		requires: ["shapeWater"],
	},

	microPrecision: {
		description: "Control small amounts of water like raindrops or sprinkles.",
		aspectId: "water",
		category: "precision",
		price: 20,
		requires: ["shapeWater"],
	},
	molecularPrecision: {
		description:
			"Manipulate water at the molecular level, enabling phase changes and fine-grained humidity control.",
		aspectId: "water",
		category: "precision",
		price: 50,
		requires: ["microPrecision"],
	},

	mostlyWater: {
		description: "Manipulate liquids that are more than 50% water.",
		aspectId: "water",
		category: "impurity",
		price: 30,
		requires: ["shapeWater"],
	},
	anyLiquid: {
		description: "Manipulate any liquid, regardless of water content.",
		aspectId: "water",
		category: "impurity",
		price: 75,
		requires: ["mostlyWater"],
	},

	volumeOfBucket: {
		description: "Control water volumes up to the size of a bucket.",
		aspectId: "water",
		category: "volume",
		price: 10,
		requires: ["shapeWater"],
	},
	volumeOfBathtub: {
		description: "Manipulate water volumes up to the size of a bathtub.",
		aspectId: "water",
		category: "volume",
		price: 20,
		requires: ["volumeOfBucket"],
	},
	volumeOfSwimmingPool: {
		description: "Control water volumes up to the size of a swimming pool.",
		aspectId: "water",
		category: "volume",
		price: 50,
		requires: ["volumeOfBathtub"],
	},
	volumeOfSmallLake: {
		description: "Manipulate water volumes up to the size of a small lake.",
		aspectId: "water",
		category: "volume",
		price: 80,
		requires: ["volumeOfSwimmingPool"],
	},
	//#endregion

	//#region Wind
	breeze: {
		description: `Apply a gradual force of wind.
		Roll mobility, then choose a target.
		If they are an enemy, they lose that much movement.
		If they are an ally or yourself, they gain that much movement.
		Repeatable: Spend 1 resolve for an additional target.`,
		aspectId: "wind",
		category: "air",
		price: 5,
		requires: [],
	},
	impulse: {
		description: `Generate a quick, forceful push of air.
		Roll mobility. Move a target that many meters away from you.
		Repeatable: Spend 1 resolve for an additional target.`,
		aspectId: "wind",
		category: "air",
		price: 10,
		requires: [],
	},
	disperse: {
		description: `In an area no larger than your mobility's power, rapidly reduce the air density, potentially depriving subjects of oxygen.
		If you roll lower than your mobility's power, take that much damage.`,
		aspectId: "wind",
		category: "air",
		price: 40,
		requires: ["impulse"],
	},

	cyclone: {
		description: `Create a large, powerful windstorm with an area no larger than your mobility's power.
		Make a mobility attack against all affected characters, then move them a distance equal to the damage dealt in a chosen cardinal direction.`,
		aspectId: "wind",
		category: "weather",
		price: 75,
		requires: ["breeze"],
	},

	cancelSound: {
		description: "Nullify or reduce sound in an area.",
		aspectId: "wind",
		category: "sound",
		price: 10,
		requires: ["disperse"],
	},
	amplifySound: {
		description: "Increase the volume or reach of sounds.",
		aspectId: "wind",
		category: "sound",
		price: 10,
		requires: ["disperse"],
	},

	featherFall: {
		description: `Lower the speed of your descent and make a soft landing.
		Passive: You cannot take damage from falling.`,
		aspectId: "wind",
		category: "acrobatics",
		price: 5,
		requires: ["breeze"],
	},
	leapHigh: {
		description: `Use wind to jump to great heights.
		Roll mobility. Leap vertically that many meters.`,
		aspectId: "wind",
		category: "acrobatics",
		price: 10,
		requires: ["impulse"],
	},
	leapFar: {
		description: `Use wind to jump long distances horizontally.
		Roll mobility. Leap that many meters, ignoring any ground effects.`,
		aspectId: "wind",
		category: "acrobatics",
		price: 30,
		requires: ["impulse"],
	},
	dash: {
		description: `Move quickly in short bursts using wind propulsion.
		In combat, this doubles your movement for the turn.`,
		aspectId: "wind",
		category: "acrobatics",
		price: 20,
		requires: ["breeze"],
	},
	dodging: {
		description: `Use wind to enhance reflexes and avoid attacks.
		In combat: Roll a boost die. Add that to your attack evasion until your next turn.`,
		aspectId: "wind",
		category: "acrobatics",
		price: 20,
		requires: ["breeze"],
	},
	//#endregion

	//#region Light
	dancingLights: {
		description: "Create and control small, floating lights.",
		aspectId: "light",
		category: "light",
		price: 5,
		requires: [],
	},
	raysOfProtection: {
		description: `Create a protective shield of solid light. Characters must use an action and roll higher than your intellect's power to break it.
		Repeatable: Spend 1 resolve to bolster the shield, making it require an additional attack.`,
		aspectId: "light",
		category: "light",
		price: 10,
		requires: ["dancingLights"],
	},
	raysOfJudgment: {
		description: `Attack targets with columns of burning light, no further than your intellect's power.`,
		aspectId: "light",
		category: "light",
		price: 25,
		requires: ["dancingLights"],
	},

	healing: {
		description: `Repeatable: Touch a target. Roll intellect and give them that much health.`,
		aspectId: "light",
		category: "restoration",
		price: 20,
		requires: [],
	},
	blessing: {
		description: `Touch a target to give them a blessing. While blessed, attacks against them deal halved damage.
		The blessing cancels if you or the target are downed.`,
		aspectId: "light",
		category: "restoration",
		price: 50,
		requires: ["healing"],
	},

	strengthen: {
		description:
			"Touch a target to add +1 boost die to their next strength roll.",
		aspectId: "light",
		category: "inspiration",
		price: 30,
		requires: [],
	},
	stimulate: {
		description: "Touch a target to add +1 boost die to their next sense roll.",
		aspectId: "light",
		category: "inspiration",
		price: 30,
		requires: [],
	},
	hasten: {
		description:
			"Touch a target to add +1 boost die to their next mobility roll.",
		aspectId: "light",
		category: "inspiration",
		price: 30,
		requires: [],
	},
	enlighten: {
		description:
			"Touch a target to add +1 boost die to their next intellect roll.",
		aspectId: "light",
		category: "inspiration",
		price: 30,
		requires: [],
	},
	embolden: {
		description: "Touch a target to add +1 boost die to their next wit roll.",
		aspectId: "light",
		category: "inspiration",
		price: 30,
		requires: [],
	},

	multitarget: {
		description: `For any touch action, spend 1 resolve to affect a target you can see.
		Repeatable: Spend 1 resolve for an additional target.`,
		aspectId: "light",
		category: "application",
		price: 50,
		requires: [],
	},
	areaOfEffect: {
		description: `For any touch action, spend 1 resolve to affect all targets in a 5 meter area.
		Repeatable: Spend 1 resolve for an additional 5 meters.`,
		aspectId: "light",
		category: "application",
		price: 50,
		requires: [],
	},
	//#endregion

	//#region Darkness
	sphereOfDarkness: {
		description: `Create an area of darkness no larger than your wit's power. This area blocks or erases any form of light, including solid light.
		You may only have one active sphere of darkness at a time.`,
		aspectId: "darkness",
		category: "darkness",
		price: 10,
		requires: [],
	},
	theUnseenArms: {
		description: `Summon several dark shadowy arms from the ground around you, which you can see, but others cannot.
		Choose a target no further than your wit's power. Grapple them. They cannot move while the arms are in play. Attacks against them have +1 boost die.
		They must use an action to roll strength vs. your wit to break free.
		The arms are cancelled when you use another aspect skill.
		Repeatable: Spend 1 resolve for an additional target.`,
		aspectId: "darkness",
		category: "darkness",
		price: 25,
		requires: [],
	},

	empoweringMoonlight: {
		description: "Your rolls have +1 boost die per moon in the sky.",
		aspectId: "darkness",
		category: "astronomy",
		price: 40,
		requires: [],
	},
	empoweringDark: {
		description: "Your rolls have +1 boost die at night.",
		aspectId: "darkness",
		category: "astronomy",
		price: 40,
		requires: [],
	},

	phantomImage: {
		description: `Create the image of any known object or character of your choice. The image does not have a solid form.
		Characters must use an action to roll higher intellect or sense than your wit's power to see through the illusion.`,
		aspectId: "darkness",
		category: "illusions",
		price: 10,
		requires: [],
	},
	phantomSound: {
		description: `Recreate a known sound with no discernable source.
		Characters must use an action to roll higher intellect or sense than your wit's power to see through the illusion.`,
		aspectId: "darkness",
		category: "illusions",
		price: 10,
		requires: [],
	},
	mirrorImage: {
		description: `Create illusory duplicates of yourself.
		The next time you're attacked, add a boost die to your evasion.`,
		aspectId: "darkness",
		category: "illusions",
		price: 25,
		requires: ["phantomImage"],
	},
	invisibility: {
		description: `Render yourself or a target invisible. Invisible targets cannot be targeted by actions requiring visibility.
		The invisibility ends when using another aspect skill, or when you end it with an action.
		By default, you can only make one target invisible at a time.
		Repeatable: Spend 1 resolve to make one additional target invisible at a time.`,
		aspectId: "darkness",
		category: "illusions",
		price: 50,
		requires: [],
	},

	introspect: {
		description: "Gain insight of a target's mood or intent.",
		aspectId: "darkness",
		category: "social",
		price: 20,
		requires: [],
	},
	charm: {
		description: `Influence a target to be more favorably disposed towards you. Your next wit roll against them has +1 boost die.`,
		aspectId: "darkness",
		category: "social",
		price: 30,
		requires: ["introspect"],
	},
	intimidate: {
		description: `Strike fear into the heart of a target. Their next wit roll against you has +1 snag die.`,
		aspectId: "darkness",
		category: "social",
		price: 30,
		requires: ["introspect"],
	},

	auraOfWeakness: {
		description:
			"Create a foreboding aura no larger than your wit's power. All other characters in the area have +1 snag on all of their actions.",
		aspectId: "darkness",
		category: "weakness",
		price: 30,
		requires: [],
	},
	grievousWhispers: {
		description: `Whisper dark thoughts into a target's mind. They cannot use abilities requiring resolve until your next turn.
		Repeatable: Spend 1 resolve for an additional target.`,
		aspectId: "darkness",
		category: "weakness",
		price: 50,
		requires: [],
	},
	nightmares: {
		description: `Induce terrifying visions in a target's mind. They lose 1 resolve.
		Repeatable: Spend 1 resolve for an additional target.`,
		aspectId: "darkness",
		category: "weakness",
		price: 50,
		requires: [],
	},
	lifeTransfer: {
		description:
			"Roll wit. Transfer that many health points between two characters.",
		aspectId: "darkness",
		category: "weakness",
		price: 50,
		requires: [],
	},

	delve: {
		description: `Touch a target to read their short term memories.
		Spend 5 resolve to read their long time memories.`,
		aspectId: "darkness",
		category: "memory",
		price: 50,
		requires: ["introspect"],
	},
	rewrite: {
		description: `Touch a target to alter their short term memories.
		Spend 5 resolve: alter their long-term memories. Lose your remaining resolve.`,
		aspectId: "darkness",
		category: "memory",
		price: 100,
		requires: ["delve"],
	},

	riftwalk: {
		description:
			"Tear holes in reality to rapidly traverse distances no further than your wit's power.",
		aspectId: "darkness",
		category: "reality",
		price: 50,
		requires: [],
	},
	timeWarp: {
		description: `Warp time in an area no larger than your wit's power. You may either slow the passage of time, or speed it up.
		If slowing time, all targets in the area skip their next turn.
		If speeding time, all targets in the area gain an extra turn.
		Repeatable: Spend 1 resolve to repeat this effect. You have a 50% chance to lose your remaining resolve.`,
		aspectId: "darkness",
		category: "reality",
		price: 100,
		requires: [],
	},
	//#endregion
})
