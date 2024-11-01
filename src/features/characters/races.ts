import { List } from "~/lib/list"

export const RACES = Object.fromEntries(
	[
		{
			name: "Aquilian",
			traits:
				"Bird-like: feathered wings and tail, additional feathers elsewhere",
			abilities: [
				"Flight - Double your movement when using Fly.",
				"One with the Wind - You are immune to damage from wind.",
			],
		},
		{
			name: "Arctana",
			traits: "Bear-like: round fuzzy ears, small round tail",
			abilities: [
				"Natural Intellect - Your Intellect rolls have +1 boost die.",
				"Resourceful - You have one extra action point.",
			],
		},
		{
			name: "Cetacian",
			traits:
				"Fish-like: webbed head fins, tail like a dolphin or whale, dorsal fin, patches of scales",
			abilities: [
				"Aquatic Affinity - Double your movement when using Swim.",
				"Sensory Superiority - Your Sense rolls have +1 boost die.",
			],
		},
		{
			name: "Felirian",
			traits:
				"Like cats and other felines: small pointed ears, slender fuzzy tail, claws",
			abilities: [
				"Slippery - You have 3 extra evasion when attacked.",
				"Restful - You gain an extra 1d4 resolve when resting.",
			],
		},
		{
			name: "Lagorei",
			traits: "Rabbit-like: VERY tall ears, stubby tail",
			abilities: [
				"Unwavering Kick - You can only use your feet for Strike actions, and you roll with +1 boost die.",
				"Leap of Confidence - Spend 1 resolve to leap: double your movement, you are in the air while moving, and you can only move in a straight line.",
			],
		},
		{
			name: "Macridian",
			traits:
				"Kangaroo-like: talk pointed ears, long fuzzed tail that's thicker at the base, a pouch",
			abilities: [
				"Natural Roamer - You don't take travel fatigue.",
				"Fury from Down Under - When pushing yourself, add one extra boost die.",
			],
		},
		{
			name: "Marenti",
			traits: "Mouse-like: large round flat ears, a long thin tail",
			abilities: [
				"Quiet as a Mouse - Sneak rolls have +1 boost die.",
				"Naturally Swift - You have 5 extra meters of movement.",
			],
		},
		{
			name: "Mendix",
			traits:
				"Bug-like: clear glassy wings like a butterfly, antennas coming out their head",
			abilities: [],
		},
		{
			name: "Myrmadon",
			traits:
				"Pangolin-like: covered in patches of hard scales on their back, arms, and shoulders",
			abilities: [
				"Natural Strength - All strike rolls have +1 boost dice.",
				"Protective Scales - Your max health is increased by 10.",
			],
		},
		{
			name: "Pyra",
			traits: "Draconic: large wings, long thick tail with scales, horns",
			abilities: [
				"Tail Whip - Use your tail to knock nearby characters prone.",
				"Descendant of the Caldera - You are immune to damage from fire and heat.",
			],
		},
		{
			name: "Renari",
			traits:
				"Like foxes, dogs, and other canines: pointed fuzzy or floppy ears, long fluffy tail",
			abilities: [
				"Sneak Attack - Spend 3 resolve to double your attack roll.",
				"Adaptable - Before the start of combat, you may swap two of your attribute dice until the end of combat.",
			],
		},
		{
			name: "Sylvanix",
			traits:
				"Deer-like: appleseed shaped fuzzy ears, antlers (even on females), small stubby tail",
			abilities: [
				"Resolute - Your max resolve is increased by 5.",
				"Nimble - Your Mobility rolls have +1 boost die.",
			],
		},
		{
			name: "Umbraleth",
			traits: "Demonic: horns, long thin spaded tail, bat wings, pointed ears",
			abilities: [
				"Devilish Charm - Your Wit rolls have +1 boost die.",
				"Descendant of Darkness - All of your attribute rolls have +1 boost die at night.",
			],
		},
	].map((race) => [
		race.name.toLowerCase(),
		{ ...race, id: race.name.toLowerCase() },
	]),
)

export type RaceName = (typeof RACE_NAMES)[number]
export const RACE_NAMES = List.of(
	...([
		"Aquilian",
		"Arctana",
		"Cetacian",
		"Felirian",
		"Lagorei",
		"Macridian",
		"Marenti",
		"Myrmadon",
		"Pyra",
		"Renari",
		"Sylvanix",
		"Umbraleth",
	] as const),
)
