import {
	type Aspect,
	DarknessAspect,
	FireAspect,
	LightAspect,
	WaterAspect,
	WindAspect,
} from "./aspects.ts"

export type AspectSkill = {
	name: string
	description: string
	aspects: ReadonlySet<Aspect>
}

export const AspectSkills: AspectSkill[] = [
	{
		name: "Absolute Dark",
		description: `For a number of rounds equal to the effect, create a black sphere of darkness of size equal to your wit. Nothing can be seen within this sphere from the inside or outside.\n\nAll targeted actions have +3 snag dice.`,
		aspects: new Set([DarknessAspect]),
	},
	{
		name: "Curse of Restlessness",
		description: `Passive. Other nearby characters roll with +2 snag dice.`,
		aspects: new Set([DarknessAspect]),
	},
	{
		name: "Illusion of Identity",
		description: `Secretly choose another visible target no further than a distance equal to the effect. When that target makes an action, prevent it and switch locations with them. `,
		aspects: new Set([DarknessAspect]),
	},
	{
		name: "Mimic",
		description: `Choose a target. Use one of their aspect skills this turn as your extra action without taking fatigue.`,
		aspects: new Set([DarknessAspect]),
	},
	{
		name: "Mirage",
		description: `Create mirror image illusions of a number of targets no greater than the effect.\n\nWhen any target would take damage, you may roll wit higher than the amount to prevent it.\n\nIf you fail, the images disappear, and you also take that amount of damage as fatigue.`,
		aspects: new Set([DarknessAspect]),
	},
	{
		name: "Shadow Cloak",
		description: `Turn invisible for turns equal to the effect.`,
		aspects: new Set([DarknessAspect]),
	},
	{
		name: "Shadows of Exhaustion",
		description: `Secretly curse a number of targets no greater than the effect. At the end of any targets’ turn, if they moved on their turn, they take fatigue equal to the distance moved, then dispel all curses from this action.`,
		aspects: new Set([DarknessAspect]),
	},
	{
		name: "Stealth Strike",
		description: `Secretly choose a visible, unoccupied area of size equal to the effect, no further than a distance equal to your wit.\n\nWhen a character walks across this area, at the end of their turn, roll wit and deal double that much damage to them.`,
		aspects: new Set([DarknessAspect]),
	},
	{
		name: "Cinder Storm",
		description: `Choose an area no further away than the value of your strength in meters. At that area, summon a storm of size equal to the effect which rains down fiery projectiles. \n\nTake damage equal to the effect. Deal twice the effect of damage to characters within that area. Affected characters’ areas catch fire.`,
		aspects: new Set([FireAspect]),
	},
	{
		name: "Empowering Flame",
		description: `Passive. Fires fill you with empowerment. While there is a fire within a distance equal to your strength die, without using an action, you may take one damage to extinguish the fire and double the damage of your next action.`,
		aspects: new Set([FireAspect]),
	},
	{
		name: "Fireblast",
		description: `Create a powerful stream of flame dealing damage equal to the effect to targets in a straight line of distance equal to your strength value. Take one damage for each affected target. Affected areas catch fire.`,
		aspects: new Set([FireAspect]),
	},
	{
		name: "Fists of Fiery Fury",
		description: `Your fists take on a bright burning ember which ignites fires on contact. Gain fury points equal to the effect. Until the end of combat, when you make an unarmed Strike (General%20Skills%20c231c7d0b6f84367abb6e0f12372860e/Strike%208d0e40750d1f4bc080a681fcf17047c3.md) action, take one damage and add your fury points to the damage dealt. This can stack.`,
		aspects: new Set([FireAspect]),
	},
	{
		name: "Infernal Rage",
		description: `You summon a forceful raging inferno around you. Take damage equal to the effect. Deal damage equal to double the effect to adjacent characters and push them one meter away from you.`,
		aspects: new Set([FireAspect]),
	},
	{
		name: "Quake",
		description: `Stomp the ground to create hot, glowing cracks through the ground in all four directions. Each one covers a straight line of distance equal to the effect. Take damage equal to the effect.\n\nAt the end of your turn, roll your strength and deal that much damage to characters who occupy the areas of the cracks.\n\nThe cracks turn into igneous rock when in contact with water or high wind.`,
		aspects: new Set([FireAspect]),
	},
	{
		name: "Smelt",
		description: `Strike a rocky or metallic object up to eisenkind masses equal to the effect. Send immense heat through it, melting it and turning it into lava. Take one fatigue for each eisenkind mass that was melted, rounded up.`,
		aspects: new Set([FireAspect]),
	},
	{
		name: "Deadly Eclipse",
		description: `Secretly curse a number of visible targets no greater than the effect. Take one damage per target.\n\nWhen any target deals damage, remove all curses from this action, roll strength and deal that much damage to the target, then the target catches fire. They take 5 damage at the end of their turn while burning.`,
		aspects: new Set([FireAspect, DarknessAspect]),
	},
	{
		name: "Aura of Deflection",
		description: `Until the start of your next turn, if an ally takes damage, subtract the effect from it and take one fatigue.`,
		aspects: new Set([LightAspect]),
	},
	{
		name: "Aura of Empowerment",
		description: `Choose a number of other characters no greater than the effect. \n\nUntil the start of your next turn, targets add your fatigue to their action rolls’ effects.`,
		aspects: new Set([LightAspect]),
	},
	{
		name: "Aura of Unburdening",
		description: `Choose a number of other characters no greater than the effect.\n\nUntil the start of your next turn, subtract your fatigue amount from the targets’ fatigue damage.`,
		aspects: new Set([LightAspect]),
	},
	{
		name: "Commune with Light",
		description: `Ignore snag dice for this roll. Subtract the effect from your fatigue. You cannot take primary actions next turn.`,
		aspects: new Set([LightAspect]),
	},
	{
		name: "Healing Glow",
		description: `Target a number of visible characters equal to the effect. Targets feel a comforting glow and heal damage equal to your fatigue at the time of the roll.`,
		aspects: new Set([LightAspect]),
	},
	{
		name: "Life's Blessing",
		description: `Place a blessing on another character you can touch. Remove any other of your existing blessings.\n\nWhen that character would take damage bringing them to their stress threshold, consume the blessing, prevent the damage, then heal damage equal to your fatigue.`,
		aspects: new Set([LightAspect]),
	},
	{
		name: "Unburden",
		description: `Touch a target. Fill them with a restful glow that heals all of their fatigue. Take that same amount of fatigue.`,
		aspects: new Set([LightAspect]),
	},
	{
		name: "Unmasking Light",
		description: `Passive. You can see any character that would otherwise be invisible if they have less fatigue than you.`,
		aspects: new Set([LightAspect]),
	},
	{
		name: "Hidden Deflection",
		description: `Secretly place deflection points on a visible target equal to the effect.\n\nThe next time they take damage, prevent no more than the number of deflection points, then take that same amount as fatigue.`,
		aspects: new Set([LightAspect, DarknessAspect]),
	},
	{
		name: "Burning Flash",
		description: `A bright crackling ember engulfs you. Deal damage to adjacent characters equal to the effect. Take fatigue equal to the number of affected characters.`,
		aspects: new Set([LightAspect, FireAspect]),
	},
	{
		name: "Aquatic Path",
		description: `Create a walkable bridge of water. The bridge starts at your current area and extends in a chosen direction a distance no greater than your sense. It falls after rounds equal to the effect.`,
		aspects: new Set([WaterAspect]),
	},
	{
		name: "Blinding Mist",
		description: `Create a circular thick cloud of mist with a size equal to the effect.\n\nAll non-water users within the cloud have +3 snag dice on targeted actions.`,
		aspects: new Set([WaterAspect]),
	},
	{
		name: "Crystal Prison",
		description: `Create a dome of solid, opaque ice of a size equal to the effect. Characters must succeed a strength roll with +3 snag dice vs. your sense to break the ice. The ice cannot be melted.`,
		aspects: new Set([WaterAspect]),
	},
	{
		name: "Frostbite",
		description: `Choose an area of size no greater than the effect. All characters in this area feel the wrath of the bitter cold. They cannot use aspect skills until the start of your next turn.`,
		aspects: new Set([WaterAspect]),
	},
	{
		name: "Permafrost",
		description: `Touch the ground. The area beneath you of a size equal to the effect turns to ice.\n\nIf a character wants to move across the ice, they must make a mobility roll higher than the attempted movement distance. If they fail, they fall and cannot move for the rest of their turn.`,
		aspects: new Set([WaterAspect]),
	},
	{
		name: "Sphere of Breathing",
		description: `A sphere around you of size equal to the effect becomes a breathable zone which water cannot enter. You must use an action to stop this effect.`,
		aspects: new Set([WaterAspect]),
	},
	{
		name: "Waterwalk",
		description: `Passive. Walk on water as if it were solid ground.`,
		aspects: new Set([WaterAspect]),
	},
	{
		name: "Whispers of the Mist",
		description: `Through the moisture present in the air, you can map out your environment with incredible precision.\n\nBecome aware of all objects and characters within a distance equal to the effect.`,
		aspects: new Set([WaterAspect]),
	},
	{
		name: "Geyser Trap",
		description: `Secretly choose an area of size equal to the effect, no further than your sense.\n\nAt the end of any character’s turn, if they are within this area, powerful jets of hot water and steam shoot from cracks in the ground. Roll your sense and your wit, and deal combined damage to all characters in the area. This effect only triggers once.`,
		aspects: new Set([WaterAspect, DarknessAspect]),
	},
	{
		name: "Thunderous Rage",
		description: `You cannot use this while thunderous rage is active.\n\nSummon a powerful thunderstorm. Lightning strikes you and all visible characters, dealing damage equal to the effect. Fires ignite in affected areas.\n\nAt the start of your next turn, rain falls and douses every visible fire. The rain lasts while the thunderstorm is active.\n\nYou must use an action to end the thunderstorm.`,
		aspects: new Set([WaterAspect, FireAspect]),
	},
	{
		name: "Healing Mist",
		description: `Take one fatigue. Summon a temporary mist of size equal to the effect which heals affected characters an amount equal to your fatigue.`,
		aspects: new Set([WaterAspect, LightAspect]),
	},
	{
		name: "Annoyingly Nimble",
		description: `Passive. If you roll Mobility (Attributes%20293fb106d9a34cbb82aebb6fd6b19e6f/Mobility%20ded77836aa9542e896d3bec166eed385.md) against a Strike (General%20Skills%20c231c7d0b6f84367abb6e0f12372860e/Strike%208d0e40750d1f4bc080a681fcf17047c3.md) action and fail, you may roll again, once. Your reroll ignores snag dice.`,
		aspects: new Set([WindAspect]),
	},
	{
		name: "Asphyxiate",
		description: `Choose a random number of characters equal to the effect. Each character is temporarily robbed of breathing air and takes fatigue equal to the effect.`,
		aspects: new Set([WindAspect]),
	},
	{
		name: "Crippling Shout",
		description: `Make a shout and make use of the air to amplify its volume.\n\nCharacters may take an action to shield their ears and deafen until the start of their next turn.\n\nEvery present, hearing character must succeed a competing Strength (Attributes%20293fb106d9a34cbb82aebb6fd6b19e6f/Strength%201d86af6ba59e40e7a34b75952ad3ee01.md) or Sense (Attributes%20293fb106d9a34cbb82aebb6fd6b19e6f/Sense%20fc9761b47cbb4ff2a86a406988484f2b.md) roll, otherwise they take fatigue equal to the effect.`,
		aspects: new Set([WindAspect]),
	},
	{
		name: "Hand of Movement",
		description: `Summon a gust of wind which moves a chosen target in a random direction equal to the effect.`,
		aspects: new Set([WindAspect]),
	},
	{
		name: "Shielding Wind",
		description: `Summon a powerful blast of wind in an area equal to the effect. All characters in the area must move in a random direction equal to the effect.`,
		aspects: new Set([WindAspect]),
	},
	{
		name: "Slipstream",
		description: `All characters must succeed a competing strength or mobility roll. On failure, they are knocked prone by a stream of wind, and cannot move until the start of your next turn.`,
		aspects: new Set([WindAspect]),
	},
	{
		name: "Sphere of Silence",
		description: `Create a sphere of size equal to the effect. This sphere follows your location. All sound that enters the sphere is cancelled; nothing within the sphere can be heard inside or from outside. You must use another action to end this effect.`,
		aspects: new Set([WindAspect]),
	},
	{
		name: "Wind Riding",
		description: `Fly in a straight line a distance equal to double the effect.`,
		aspects: new Set([WindAspect]),
	},
	{
		name: "Wind Slash",
		description: `Launch a slash of wind a distance equal to your mobility. Every affected character must move in a random direction off the path a distance equal to the effect.`,
		aspects: new Set([WindAspect]),
	},
	{
		name: "Aimless Fury",
		description: `Choose a number of random characters equal to the effect, potentially including yourself. Each one catches fire and takes damage equal to the effect.`,
		aspects: new Set([WindAspect, FireAspect]),
	},
	{
		name: "Radiant Breeze",
		description: `Choose a number of random visible targets equal to the effect. Take fatigue equal to the number of chosen targets. Targets heal damage equal to your fatigue.`,
		aspects: new Set([WindAspect, LightAspect]),
	},
	{
		name: "Wrathful Tempest",
		description: `You cannot use this while a cyclone is active.\n\nSummon a strong rainy whirlwind. Douse all fires.\n\nWhile the cyclone is in effect, at the end of your turn, all characters and objects must move in a random direction equal to the effect, if able.\n\nYou must use an action to end the cyclone.`,
		aspects: new Set([WindAspect, WaterAspect]),
	},
]
