import { Brand } from "effect"
import { Iterator } from "iterator-helpers-polyfill"
import { camelCase } from "lodash-es"
import { unwrap } from "~/helpers/errors.ts"
import { entries, fromEntries, keys, mapValues, values } from "~/helpers/object.ts"
import { titleCase } from "~/helpers/string.ts"
import { getAspect, type Aspect } from "../aspects/data.ts"
import type { Attribute } from "../attributes/data.ts"

export type TierId = string & Brand.Brand<"TierId">
export const TierId = Brand.nominal<TierId>()

export type SkillId = string & Brand.Brand<"SkillId">
export const SkillId = Brand.nominal<SkillId>()

export interface Tier {
	id: TierId
	name: string
	number: number
	readonly skills: Skill[]
}

export interface Skill {
	id: SkillId
	name: string
	description: string
	readonly tier: Tier
	readonly aspect: Aspect
	readonly attribute: Attribute
}

type AspectSkillTree = Record<
	Aspect["id"],
	{
		tiers: Array<{
			name: string
			skills: Record<string, { description: string }>
		}>
	}
>

const aspectSkillTree: AspectSkillTree = {
	fire: {
		tiers: [
			{
				name: "Alter",
				skills: {
					heatObject: {
						description: `Touch an object to send heat through it.`,
					},
					heatAir: {
						description: `Heat up the surrounding air.`,
					},
					alterFlame: {
						description: `Manipulate a flame within range without changing the temperature or the amount of it.`,
					},
					redirect: {
						description: `Take lightning or electricity and redirect it someplace else.`,
					},
				},
			},
			{
				name: "Create",
				skills: {
					makeLightning: {
						description: `Create a sphere of fire in your palm, enough to power or short-circuit small to medium size devices.`,
					},
					makeFlame: {
						description: `Create a baseball-sized fire in your palm.`,
					},
					becomeFlame: {
						description: `Engulf yourself or another character in a bright crackling ember. While in this state, double all damage dealt and all damage received.`,
					},
				},
			},
			{
				name: "Control",
				skills: {
					fireResistance: {
						description: `Before taking damage from fire, roll strength and reduce it by that amount.`,
					},
					lightningResistance: {
						description: `Before taking damage from lightning, roll strength and reduce it by that amount.`,
					},
					suppress: {
						description: `Immediately extinguish any number of exposed fires.`,
					},
					insulate: {
						description: `Cancel the flow of electricity in the surrounding air or in an object.`,
					},
				},
			},
			{
				name: "Imbue",
				skills: {
					sparkObject: {
						description: `Touch an object to send electricity through it.`,
					},
					sparkAir: {
						description: `Lightly electrify the air around you.`,
					},
					quake: {
						description: `Create molten cracks through stone or metal.`,
					},
					ignite: {
						description: `Set fire to a surface.`,
					},
				},
			},
			{
				name: "Summon",
				skills: {
					fireball: {
						description: `Create and propel a large ball of fire that bursts on impact.`,
					},
					arcOfFlame: {
						description: `Swipe your hand or foot to create a massive arc of flame in front of yourself.`,
					},
					cinderStorm: {
						description: `Summon a storm of raining fireballs.`,
					},
					lightningStorm: {
						description: `Summon lightning to strike several areas.`,
					},
				},
			},
		],
	},
	water: {
		tiers: [
			{
				name: "Alter",
				skills: {
					frostTouch: {
						description: `Touch a surface to send cooling through it.`,
					},
					cooling: {
						description: `Lower the temperature of surrounding air.`,
					},
					moisten: {
						description: `Increase the humidity of surrounding air.`,
					},
				},
			},
			{
				name: "Reform",
				skills: {
					shapeWater: {
						description: `Move, shape, or propel gatherings of water.`,
					},
					shapeIce: {
						description: `Move, break, or reform chunks of ice.`,
					},
				},
			},
			{
				name: "Transform",
				skills: {
					condensate: {
						description: `Gather and collect moisture in the surrounding air into water.`,
					},
					rapidMelt: {
						description: `Rapidly turn ice into water.`,
					},
					flashFreeze: {
						description: `Rapidly turn bodies of water into ice.`,
					},
					solidify: {
						description: `Rapidly turn air moisture into ice.`,
					},
					evaporate: {
						description: `Rapidly evaporate bodies of water.`,
					},
					vaporize: {
						description: `Rapidly turn ice into air moisture.`,
					},
				},
			},
			{
				name: "Sense",
				skills: {
					whispersOfTheMist: {
						description: `Increase awareness of object through surrounding air moisture.`,
					},
					whispersOfTheSea: {
						description: `Increase awareness of object through bodies of water.`,
					},
					whispersOfFrost: {
						description: `Increase awareness of object through vibrations of ice.`,
					},
				},
			},
			{
				name: "Detect",
				skills: {
					ensnareWater: {
						description: `You can control non-water liquids as if they were water.`,
					},
				},
			},
		],
	},
	wind: {
		tiers: [
			{
				name: "Coincide",
				skills: {
					formOfAFeather: {
						description: `Move as if under reduced gravity. Fall slowly, jump higher, and perform eased acrobatics.`,
					},
				},
			},
			{
				name: "Direct",
				skills: {
					gust: {
						description: `Create variable-strength haphazard gusts of wind to apply sudden impulses to objects and yourself.`,
					},
					breeze: {
						description: `Increase the wind speed around you to apply sustained forces to objects and yourself. This can allow you to fly.`,
					},
					dampenWind: {
						description: `Decrease or completely cancel the surrounding flow of wind.`,
					},
				},
			},
			{
				name: "Shape",
				skills: {
					shapeWind: {
						description: `Morph wind into a simple shape and control its movement.`,
					},
					modulate: {
						description: `Control the volume and propagation of sound.`,
					},
				},
			},
			{
				name: "Modulate",
				skills: {
					condenseAir: {
						description: `Thicken the density of the air, applying more apparent pressure to those within.`,
					},
					disperse: {
						description: `Decrease the density of air to a vacuum, depriving subjects within of breathing air.`,
					},
					alterSound: {
						description: `Control the volume and propagation of sound in the surrounding area.`,
					},
				},
			},
			{
				name: "Integrate",
				skills: {
					alterAtmosphere: {
						description: `Change the weather conditions of the surrounding environment.`,
					},
					foresee: {
						description: `Become one with the surrounding environment to predict changing weather conditions in the future.`,
					},
				},
			},
		],
	},
	light: {
		tiers: [
			{
				name: "Illuminate",
				skills: {
					summonLight: {
						description: `Create and control floating orbs of light.`,
					},
					illuminatingTouch: {
						description: `Give a target a warming glow.`,
					},
				},
			},
			{
				name: "Restore",
				skills: {
					healingLight: {
						description: `Touch a character to heal their damage.`,
					},
					comfortingLight: {
						description: `Touch a character to heal their fatigue.`,
					},
					strengtheningLight: {
						description: `Touch a character to strengthen them and temporarily increase the power of their actions.`,
					},
				},
			},
			{
				name: "Bless",
				skills: {
					barrier: {
						description: `Conjure large walls of solidified light.`,
					},
					rayOfProtection: {
						description: `Create a shield of light that protects others from damaging threats.`,
					},
					rayOfJustice: {
						description: `Conjure and direct sharp spears of light.`,
					},
				},
			},
			{
				name: "Protect",
				skills: {
					discernReality: {
						description: `See everything around you as it is, unaffected by mirages, invisibility, faces, and other forms of light and perception-altering illusions.`,
					},
					pierceReality: {
						description: `See through walls and other solid objects.`,
					},
				},
			},
			{
				name: "Perceive",
				skills: {
					healingAura: {
						description: `Emit a warming glow to heal damage from surrounding characters.`,
					},
					comfortingAura: {
						description: `Emit a comforting glow to heal fatigue from surrounding characters.`,
					},
					strengtheningAura: {
						description: `Emit an uplifting glow to strengthen surrounding characters.`,
					},
				},
			},
		],
	},
	darkness: {
		tiers: [
			{
				name: "Influence",
				skills: {
					intimidate: {
						description: `Induce feelings of dread in a character you can see.`,
					},
					charm: {
						description: `Induce feelings of favor or attraction in a character you can see, towards yourself or another character.`,
					},
					spotlight: {
						description: `Increase your presence or that of another nearby character, such that it’s much harder to overlook you.`,
					},
					sneak: {
						description: `Lower your presence or that of another nearby character, such that others are less likely to notice you.`,
					},
				},
			},
			{
				name: "Curse",
				skills: {
					auraOfWeakness: {
						description: `Take on a dark, overpowering glow that physically weakens other characters.`,
					},
					auraOfSickness: {
						description: `Take on a dark, foreboding glow that mentally weakens other characters.`,
					},
				},
			},
			{
				name: "Deceive",
				skills: {
					invisibility: {
						description: `Turn invisible, such that visible light passes through you, and vice versa.`,
					},
					disguise: {
						description: `Change the outward appearance of a character or object you can see.`,
					},
					facade: {
						description: `Create identical but untouchable mirror images of a character or object you can see.`,
					},
				},
			},
			{
				name: "Rewrite",
				skills: {
					alterEmotion: {
						description: `Touch a character to change the strength of a chosen emotion in them.`,
					},
					alterSenses: {
						description: `Amplify or dampen a chosen sense of a person you can touch.`,
					},
					alterMemories: {
						description: `Change the memories of a character you can touch.`,
					},
				},
			},
			{
				name: "Disintegrate",
				skills: {
					phase: {
						description: `Float and phase through solid objects.`,
					},
					riftwalk: {
						description: `Create tears in reality that allow you to move from one place to another.`,
					},
				},
			},
		],
	},
}

const tiersByAspect: Record<Aspect["id"], Tier[]> = mapValues(aspectSkillTree, (aspect) =>
	aspect.tiers.map(({ name, skills }, index) => ({
		id: TierId(camelCase(name)),
		name,
		number: index + 1,
		get skills() {
			return keys(skills)
				.map((key) => unwrap(aspectSkillsById[SkillId(key)]))
				.toArray()
		},
	})),
)

const aspectSkillsById: Record<SkillId, Skill> = fromEntries(
	entries(aspectSkillTree).flatMap(([aspectId, { tiers }]) => {
		return Iterator.from(tiers).flatMap(({ skills }, tierIndex) => {
			return entries(skills).map(([id, { description }]) => {
				const skill: Skill = {
					id: SkillId(id),
					description,
					name: titleCase(id),
					get tier() {
						return unwrap(tiersByAspect[aspectId][tierIndex])
					},
					get aspect() {
						return getAspect(aspectId)
					},
					get attribute() {
						return getAspect(aspectId).attribute
					},
				}
				return [id, skill] as const
			})
		})
	}),
)

const allSkills = Iterator.from(values(aspectSkillsById)).flatten()

export const getAspectSkill = (id: SkillId) => aspectSkillsById[id]
export const listAspectSkills = () => allSkills
export const listAspectSkillIds = () => Iterator.from(keys(aspectSkillsById))

export function listAspectSkillsByAspect(aspectId: Aspect["id"]) {
	return tiersByAspect[aspectId].flatMap((tier) => tier.skills)
}

export function listAspectSkillsByTier(aspectId: Aspect["id"], tierNumber: number) {
	return tiersByAspect[aspectId][tierNumber - 1]?.skills ?? []
}

export function listAspectSkillTiers(aspectId: Aspect["id"]) {
	return tiersByAspect[aspectId]
}
