export interface InventoryItemInfo {
	name: string
	effect: string
	flavor?: string
	wealthTier: number
}

export const DEFAULT_INVENTORY_ITEMS: Record<string, InventoryItemInfo> = {
	uncookedSnack: {
		name: "Uncooked Snack",
		effect: `Restores 1d4 health and lose 1 resolve. When cooked, becomes a filling snack.`,
		wealthTier: 1,
	},
	fillingSnack: {
		name: "Filling Snack",
		effect: `Restores 3d4 health.`,
		wealthTier: 2,
	},
	haptonite: {
		name: "Haptonite",
		effect: `Your next wit roll has +1 boost die. Your next sense roll has +1 snag die.`,
		flavor: `Commonly found as a powdery mineral in the undergrowth,  distributed in a coarsely grounded form and ingested orally or nasally. Known to cause hallucinations and reduce stress. Counted in doses.`,
		wealthTier: 3,
	},
	halophilaLuciferae: {
		name: "Halophila Luciferae",
		effect: `Your next sense roll has +1 boost die. Your next wit roll has +1 snag die.`,
		flavor: `Informally known as "Glow", this saltwater-borne seagrass plant can increase focus and attention, but cause anxiety and paranoia. Counted in doses.`,
		wealthTier: 1,
	},
	handcuffs: {
		name: "Handcuffs",
		effect: `When worn, disallows the use of hands. The wearer may attempt to roll a DC 15 strength check to break free. On failure, they lose 1 resolve.`,
		wealthTier: 1,
	},
	rope: {
		name: "Rope",
		effect: ``,
		wealthTier: 1,
	},
	tinderbox: {
		name: "Tinderbox",
		effect: ``,
		wealthTier: 1,
	},
	fishingRod: {
		name: "Fishing Rod",
		effect: ``,
		wealthTier: 1,
	},
	artifactOfTeleportation: {
		name: "Artifact of Teleportation",
		effect: `Squeeze and think of a location to teleport yourself there. Has a 100-meter margin of error. Spend 1 resolve per extra person you want to bring with you.`,
		wealthTier: 6,
	},
	artifactOfOutlandianStrength: {
		name: "Artifact of Outlandian Strength",
		effect: `Increase your max health by 20.`,
		wealthTier: 6,
	},
	artifactOfImmaculateAppearance: {
		name: "Artifact of Immaculate Appearance",
		effect: `Roll wit with an extra die.`,
		wealthTier: 6,
	},
	artifactOfPersistence: {
		name: "Artifact of Persistence",
		effect: `Spend 2 resolve to reroll any roll.`,
		wealthTier: 6,
	},
	artifactOfFocus: {
		name: "Artifact of Focus",
		effect: `Increase your max resolve by 10.`,
		wealthTier: 6,
	},
	charmingVioletBoutonniere: {
		name: "Charming Violet Boutonnière",
		effect: `Characters with wit lower than yours cannot damage you.`,
		wealthTier: 5,
	},
	quillOfEvaporation: {
		name: "Quill of Evaporation",
		effect: `Resist all water damage.`,
		wealthTier: 4,
	},
	aviatorsGoggles: {
		name: "Aviator's Goggles",
		effect: `+1 boost die to sense rolls while in the air.`,
		wealthTier: 4,
	},
	energyDrink: {
		name: "Energy Drink",
		effect: `+1 boost die to next Mobility roll`,
		wealthTier: 2,
	},
	proteinDrink: {
		name: "Protein Drink",
		effect: `+1 boost die to next Strength roll`,
		wealthTier: 2,
	},
	calmingTea: {
		name: "Calming Tea",
		effect: `+1 boost die to next Sense roll`,
		wealthTier: 2,
	},
	stimulatingTea: {
		name: "Stimulating Tea",
		effect: `+1 boost die to next Intellect roll`,
		wealthTier: 2,
	},
	glassOfWine: {
		name: "Glass of Wine",
		effect: `+1 boost die to next Wit roll`,
		wealthTier: 3,
	},
	stylishOutfit: {
		name: "Stylish Outfit",
		effect: `+1 boost die to Wit rolls while worn`,
		wealthTier: 3,
	},
	comfyCoat: {
		name: "Comfy Coat",
		effect: `Immune to negative effects from cold. When you take damage, you may reduce it by 1d4.`,
		wealthTier: 3,
	},
	igneousVest: {
		name: "Igneous Vest",
		effect: `Increase your defense against fire damage by 5.`,
		wealthTier: 4,
	},
	lighteningGarb: {
		name: "Lightening Garb",
		effect: `+1 boost die to Mobility rolls.`,
		wealthTier: 3,
	},
	spiderBatEgg: {
		name: "Spider Bat Egg",
		effect: "",
		wealthTier: 3,
	},
	moonbeastVenison: {
		name: "Moonbeast Venison",
		effect: `Uncooked: restore 1d4 health, lose 1d4 resolve. Cooked: restore 3d4 health`,
		wealthTier: 3,
	},
	spiderBatSilk: {
		name: "Spider Bat Silk",
		effect: "",
		wealthTier: 3,
	},
	spiderBatHide: {
		name: "Spider Bat Hide",
		effect: "",
		wealthTier: 3,
	},
	spiderBatVenom: {
		name: "Spider Bat Venom",
		effect: "",
		wealthTier: 3,
	},
	moonbeastHorn: {
		name: "Moonbeast Horn",
		effect: `+1 boost die to attacks made with this item.`,
		wealthTier: 4,
	},
	binoculars: {
		name: "Binoculars",
		effect: `+1 boost die to sighted actions`,
		wealthTier: 3,
	},
	sharpInstrument: {
		name: "Sharp Instrument",
		effect: `+2 boost die on attacks made with this weapon`,
		wealthTier: 3,
	},
	bluntObject: {
		name: "Blunt Object",
		effect: `+2 boost dice on attacks made with this weapon`,
		wealthTier: 3,
	},
	umbrella: {
		name: "Umbrella",
		effect: `Avoid negative effects that would come from getting drenched by rain, or any other falling source of water`,
		wealthTier: 2,
	},
	enchantedWhisperwoodBow: {
		name: "Enchanted Whisperwood Bow",
		effect: `+3 boost dice to attacks made with this weapon.`,
		wealthTier: 5,
	},
	swordOfChampions: {
		name: "Sword of Champions",
		effect: `+3 boost dice to attacks made with this weapon.`,
		wealthTier: 5,
	},
	crossbow: {
		name: "Crossbow",
		effect: `+1 boost die to attacks made with this item.`,
		wealthTier: 3,
	},
}
