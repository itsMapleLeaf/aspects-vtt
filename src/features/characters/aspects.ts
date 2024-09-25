import { startCase } from "lodash-es"
import { raise } from "~/shared/errors.ts"
import { List } from "~/shared/list.ts"
import { formatTitle } from "~/shared/string.ts"

export class Aspect {
	name: string
	description: string

	constructor(readonly id: keyof typeof Aspect.DATA) {
		this.name = startCase(id)
		this.description = Aspect.DATA[id].description
	}

	private static readonly DATA = {
		fire: {
			description: "flame, heat, and lightning",
		},
		water: {
			description: "water, vapor, ice, and cold",
		},
		wind: {
			description: "air, wind, and weather",
		},
		light: {
			description: "healing, buffs, and physical light",
		},
		darkness: {
			description: "flame, heat, and lightning",
		},
	} satisfies Record<string, { description: string }>
}

export class AspectSkill {
	readonly name: string
	readonly description: string
	readonly aspectId: Aspect["id"]
	readonly category: string
	readonly price: number
	readonly requirementIds: List<string>

	constructor(readonly id: keyof typeof AspectSkill.DATA) {
		const data = AspectSkill.DATA[id]
		this.name = formatTitle(id)
		this.description = data.description
		this.aspectId = data.aspectId
		this.category = data.category
		this.price = data.price
		this.requirementIds = List.from(data.requires)
	}

	static all() {
		return List.keys(AspectSkill.DATA).map((id) => new AspectSkill(id))
	}

	static get(id: string) {
		if (id in AspectSkill.DATA) {
			return new AspectSkill(id as keyof typeof AspectSkill.DATA)
		}
	}

	get aspect() {
		return new Aspect(this.aspectId)
	}

	get requirements(): List<AspectSkill> {
		return this.requirementIds.map(
			(id) => AspectSkill.get(id) ?? raise(`Invalid aspect skill ID ${id}`),
		)
	}

	private static readonly DATA = {
		// Heat Track
		heating: {
			description: "Generate enough heat to boil water.",
			aspectId: "fire",
			category: "heat",
			price: 5,
			requires: [],
		},
		burning: {
			description: "Generate enough heat to ignite objects.",
			aspectId: "fire",
			category: "heat",
			price: 10,
			requires: ["heating"],
		},

		// Flame Track
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
			price: 5,
			requires: ["candlelight"],
		},
		fireball: {
			description: "Conjure and throw a ball of fire.",
			aspectId: "fire",
			category: "flame",
			price: 10,
			requires: ["torchlight"],
		},
		smolderingMight: {
			description:
				"Take 2 damage for +1 boost die to attack rolls, repeatable.",
			aspectId: "fire",
			category: "flame",
			price: 20,
			requires: ["torchlight"],
		},
		flamewall: {
			description: "Create a wall of fire for protection or offense.",
			aspectId: "fire",
			category: "flame",
			price: 50,
			requires: ["fireball"],
		},
		curseOfEmber: {
			description: "Inflict a fire-based curse on a target.",
			aspectId: "fire",
			category: "flame",
			price: 50,
			requires: ["fireball"],
		},

		// Lightning Track
		redirectLightning: {
			description: "Control the path of existing lightning.",
			aspectId: "fire",
			category: "lightning",
			price: 5,
			requires: [],
		},
		createLightning: {
			description: "Generate and control lightning bolts.",
			aspectId: "fire",
			category: "lightning",
			price: 10,
			requires: ["redirectLightning"],
		},
		lightningStorm: {
			description: "Take 2 damage to deal 1d6 to a visible target, repeatable.",
			aspectId: "fire",
			category: "lightning",
			price: 20,
			requires: ["createLightning"],
		},

		// Magma Track
		meltRock: {
			description: "Generate enough heat to melt rock into magma.",
			aspectId: "fire",
			category: "magma",
			price: 10,
			requires: ["burning"],
		},
		meltMetal: {
			description: "Generate enough heat to melt metal.",
			aspectId: "fire",
			category: "magma",
			price: 20,
			requires: ["meltRock"],
		},
		shapeMagma: {
			description: "Control and shape magma, limited by flame track size.",
			aspectId: "fire",
			category: "magma",
			price: 30,
			requires: ["meltMetal"],
		},

		// Tectonic Track
		shatterEarth: {
			description: "Create fissures and cracks in the ground.",
			aspectId: "fire",
			category: "tectonic",
			price: 10,
			requires: ["burning"],
		},
		cinderStorm: {
			description: "Summon a devastating storm of cinders and ash.",
			aspectId: "fire",
			category: "tectonic",
			price: 50,
			requires: ["shatterEarth"],
		},

		// Proximity Track
		touchProximity: {
			description: "Manipulate water through direct contact.",
			aspectId: "water",
			category: "proximity",
			price: 0,
			requires: [],
		},
		visibleProximity: {
			description: "Manipulate water within visible range.",
			aspectId: "water",
			category: "proximity",
			price: 5,
			requires: ["touchProximity"],
		},
		nearbyProximity: {
			description:
				"Manipulate water in the nearby area, even if not directly visible.",
			aspectId: "water",
			category: "proximity",
			price: 10,
			requires: ["visibleProximity"],
		},

		// Shape Track
		shapeWater: {
			description: "Control and shape liquid water.",
			aspectId: "water",
			category: "shape",
			price: 5,
			requires: ["touchProximity"],
		},
		shapeIce: {
			description: "Control, shape, and break ice.",
			aspectId: "water",
			category: "shape",
			price: 10,
			requires: ["shapeWater"],
		},
		shapeVapor: {
			description: "Control water vapor and create condensation.",
			aspectId: "water",
			category: "shape",
			price: 20,
			requires: ["shapeIce"],
		},

		// Precision Track
		macroPrecision: {
			description: "Manipulate large bodies of water like puddles or buckets.",
			aspectId: "water",
			category: "precision",
			price: 0,
			requires: ["touchProximity"],
		},
		microPrecision: {
			description:
				"Control small amounts of water like raindrops or sprinkles.",
			aspectId: "water",
			category: "precision",
			price: 5,
			requires: ["macroPrecision"],
		},
		molecularPrecision: {
			description:
				"Manipulate water at the molecular level, enabling phase changes.",
			aspectId: "water",
			category: "precision",
			price: 10,
			requires: ["microPrecision"],
		},

		// Temperature Track
		frost: {
			description: "Create a thin layer of frost on surfaces.",
			aspectId: "water",
			category: "temperature",
			price: 5,
			requires: ["touchProximity"],
		},
		freezeWater: {
			description: "Transform liquid water into ice.",
			aspectId: "water",
			category: "temperature",
			price: 10,
			requires: ["frost"],
		},
		freezeAir: {
			description: "Create ice directly from water vapor in the air.",
			aspectId: "water",
			category: "temperature",
			price: 20,
			requires: ["freezeWater"],
		},

		// Impurity Track
		pureWater: {
			description: "Manipulate pure water.",
			aspectId: "water",
			category: "impurity",
			price: 0,
			requires: ["touchProximity"],
		},
		mostlyWater: {
			description: "Manipulate liquids that are more than 50% water.",
			aspectId: "water",
			category: "impurity",
			price: 5,
			requires: ["pureWater"],
		},
		anyLiquid: {
			description: "Manipulate any liquid, regardless of water content.",
			aspectId: "water",
			category: "impurity",
			price: 15,
			requires: ["mostlyWater"],
		},

		// Sensing Track
		senseIce: {
			description: "Detect and sense solid ice formations.",
			aspectId: "water",
			category: "sensing",
			price: 5,
			requires: ["touchProximity"],
		},
		senseWater: {
			description: "Sense the presence and movement of liquid water.",
			aspectId: "water",
			category: "sensing",
			price: 10,
			requires: ["touchProximity"],
		},
		senseMist: {
			description: "Detect water vapor and mist in the air.",
			aspectId: "water",
			category: "sensing",
			price: 15,
			requires: ["touchProximity"],
		},

		// Volumes Track
		teacupVolume: {
			description: "Manipulate water volumes up to the size of a teacup.",
			aspectId: "water",
			category: "volumes",
			price: 0,
			requires: ["touchProximity"],
		},
		bucketVolume: {
			description: "Control water volumes up to the size of a bucket.",
			aspectId: "water",
			category: "volumes",
			price: 5,
			requires: ["teacupVolume"],
		},
		bathtubVolume: {
			description: "Manipulate water volumes up to the size of a bathtub.",
			aspectId: "water",
			category: "volumes",
			price: 10,
			requires: ["bucketVolume"],
		},
		swimmingPoolVolume: {
			description: "Control water volumes up to the size of a swimming pool.",
			aspectId: "water",
			category: "volumes",
			price: 20,
			requires: ["bathtubVolume"],
		},
		smallLakeVolume: {
			description: "Manipulate water volumes up to the size of a small lake.",
			aspectId: "water",
			category: "volumes",
			price: 30,
			requires: ["swimmingPoolVolume"],
		},

		// Air Track
		gust: {
			description: "Apply a gradual force of wind.",
			aspectId: "wind",
			category: "air",
			price: 5,
			requires: [],
		},
		impulse: {
			description: "Generate a quick, forceful push of air.",
			aspectId: "wind",
			category: "air",
			price: 5,
			requires: [],
		},
		disperse: {
			description: "Scatter and disperse airborne particles or gases.",
			aspectId: "wind",
			category: "air",
			price: 15,
			requires: ["impulse"],
		},
		sculpting: {
			description: "Shape and mold air currents with precision.",
			aspectId: "wind",
			category: "air",
			price: 15,
			requires: ["gust"],
		},

		// Weather Track
		cyclone: {
			description: "Create a powerful, rotating windstorm.",
			aspectId: "wind",
			category: "weather",
			price: 30,
			requires: ["sculpting", "gust"],
		},

		// Sound Track
		cancelSound: {
			description: "Nullify or reduce sound waves in an area.",
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

		// Acrobatics Track
		leapHigh: {
			description: "Use wind to jump to great heights.",
			aspectId: "wind",
			category: "acrobatics",
			price: 10,
			requires: ["impulse"],
		},
		leapFar: {
			description: "Use wind to jump long distances horizontally.",
			aspectId: "wind",
			category: "acrobatics",
			price: 10,
			requires: ["impulse"],
		},
		dash: {
			description: "Move quickly in short bursts using wind propulsion.",
			aspectId: "wind",
			category: "acrobatics",
			price: 20,
			requires: ["gust"],
		},
		dodging: {
			description: "Use wind to enhance reflexes and avoid attacks.",
			aspectId: "wind",
			category: "acrobatics",
			price: 20,
			requires: ["gust"],
		},

		// Light Track
		dancingLights: {
			description: "Create and control small, floating lights.",
			aspectId: "light",
			category: "light",
			price: 10,
			requires: [],
		},
		raysOfProtection: {
			description: "Create a protective shield of solid light.",
			aspectId: "light",
			category: "light",
			price: 10,
			requires: [],
		},
		raysOfJudgment: {
			description: "Attack targets by summoning columns of burning light.",
			aspectId: "light",
			category: "light",
			price: 25,
			requires: [],
		},

		// Heals Track
		restoration: {
			description: "Spend X resolve to heal Xd6 health.",
			aspectId: "light",
			category: "heals",
			price: 10,
			requires: [],
		},

		// Buffs Track
		strengthen: {
			description: "Add +1 boost die to next strength roll.",
			aspectId: "light",
			category: "buffs",
			price: 10,
			requires: [],
		},
		stimulate: {
			description: "Add +1 boost die to next sense roll.",
			aspectId: "light",
			category: "buffs",
			price: 10,
			requires: [],
		},
		hasten: {
			description: "Add +1 boost die to next mobility roll.",
			aspectId: "light",
			category: "buffs",
			price: 10,
			requires: [],
		},
		enlighten: {
			description: "Add +1 boost die to next intellect roll.",
			aspectId: "light",
			category: "buffs",
			price: 10,
			requires: [],
		},
		embolden: {
			description: "Add +1 boost die to next wit roll.",
			aspectId: "light",
			category: "buffs",
			price: 10,
			requires: [],
		},

		// Application Track
		touchApplication: {
			description: "Apply light effects through direct contact.",
			aspectId: "light",
			category: "application",
			price: 0,
			requires: [],
		},
		areaOfEffect: {
			description:
				"Spend 1 resolve to add 5 meters of AoE to any light effect, repeatable.",
			aspectId: "light",
			category: "application",
			price: 10,
			requires: ["touchApplication"],
		},
		additionalTarget: {
			description:
				"Spend 1 resolve to add an additional visible target, repeatable.",
			aspectId: "light",
			category: "application",
			price: 10,
			requires: ["touchApplication"],
		},

		// Darkness Track
		sphereOfDarkness: {
			description: "Create an area of darkness that not even light can escape.",
			aspectId: "darkness",
			category: "darkness",
			price: 10,
			requires: [],
		},

		// Illusions Track
		invisibility: {
			description: "Render yourself or a target invisible.",
			aspectId: "darkness",
			category: "illusions",
			price: 10,
			requires: [],
		},
		mirrorImage: {
			description: "Create illusory duplicates of yourself.",
			aspectId: "darkness",
			category: "illusions",
			price: 10,
			requires: [],
		},
		nightmares: {
			description: "Induce terrifying visions in a target's mind.",
			aspectId: "darkness",
			category: "illusions",
			price: 20,
			requires: [],
		},

		// Psychology Track
		introspect: {
			description: "Gain insight of a target's mood or intent.",
			aspectId: "darkness",
			category: "psychology",
			price: 5,
			requires: [],
		},
		charm: {
			description:
				"Influence a target to be more favorably disposed towards you.",
			aspectId: "darkness",
			category: "psychology",
			price: 10,
			requires: ["introspect"],
		},
		intimidate: {
			description: "Strike fear into the heart of a target.",
			aspectId: "darkness",
			category: "psychology",
			price: 10,
			requires: ["introspect"],
		},
		delve: {
			description: "Read a target's memories.",
			aspectId: "darkness",
			category: "psychology",
			price: 25,
			requires: ["introspect"],
		},
		rewrite: {
			description: "Alter a target's memories.",
			aspectId: "darkness",
			category: "psychology",
			price: 50,
			requires: ["delve"],
		},

		// Debuffs Track
		auraOfWeakness: {
			description: "Create an aura that saps the strength of those within it.",
			aspectId: "darkness",
			category: "debuffs",
			price: 10,
			requires: [],
		},
		grievousWhispers: {
			description: "Whisper dark thoughts that weaken a target's resolve.",
			aspectId: "darkness",
			category: "debuffs",
			price: 20,
			requires: [],
		},
		lifeTransfer: {
			description: "Transfer health points between two characters.",
			aspectId: "darkness",
			category: "debuffs",
			price: 20,
			requires: [],
		},

		// Reality Track
		riftwalk: {
			description: "Step through shadows to teleport short distances.",
			aspectId: "darkness",
			category: "reality",
			price: 50,
			requires: [],
		},

		// Astronomy Track
		empoweringDark: {
			description: "Your rolls have +1 boost die at night.",
			aspectId: "darkness",
			category: "astronomy",
			price: 20,
			requires: [],
		},
		empoweringMoonlight: {
			description:
				"Your rolls have +1 boost die while either moon is in the sky.",
			aspectId: "darkness",
			category: "astronomy",
			price: 20,
			requires: [],
		},
	} satisfies Record<
		string,
		{
			aspectId: Aspect["id"]
			description: string
			category: string
			price: number
			requires: string[]
		}
	>
}
