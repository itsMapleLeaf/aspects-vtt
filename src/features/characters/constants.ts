export const RACES = [
	{ name: "Aquilian" },
	{ name: "Arctana" },
	{ name: "Cetacian" },
	{ name: "Felirian" },
	{ name: "Lagorei" },
	{ name: "Macridian" },
	{ name: "Marenti" },
	{ name: "Myrmadon" },
	{ name: "Pyra" },
	{ name: "Renari" },
	{ name: "Sylvanix" },
	{ name: "Umbraleth" },
]

export const DEFAULT_WEALTH_TIER = 3
export const WEALTH_TIERS = [
	{
		name: `Homeless`,
		occupations: `Beggar, Thief`,
		greatestExpense: `Trash, meal scraps, used and torn clothing`,
	},
	{
		name: `Impoverished`,
		occupations: `Cave Miner, Prostitute, Unemployed Artist / Performer`,
		greatestExpense: `Common food or drink, night at a cheap inn, used clothing, sturdy rope, common raw materials`,
	},
	{
		name: `Lower Class`,
		occupations: `Store Clerk, Transport, Drifter`,
		greatestExpense: `Expensive food or drink, unreliable tools, light armor, entry to a club, new everyday clothes, ferry ride, uncommon raw materials`,
	},
	{
		name: `Lower Middle Class`,
		occupations: `Protector, Farmer, Fisher, Smith, Artist / Performer`,
		greatestExpense: `Reliable tools, apartment for one, a small pet, camping gear, fresh clothes, rare materials, common artifacts`,
	},
	{
		name: `Middle Class`,
		occupations: `Teacher, Business Owner, Construction Worker, Tailor`,
		greatestExpense: `Powerful tools, apartment for a few, a large or uncommon pet, strong armor, rare artifacts`,
	},
	{
		name: `Upper Middle Class`,
		occupations: `Master Craftsperson, Researcher`,
		greatestExpense: `Nice house, bodyguard, luxury transport, established business, extravagant clothes`,
	},
	{
		name: `Upper Class`,
		occupations: `Politician, City Knight, Large Business Owner`,
		greatestExpense: `A mansion, hired assassins, very rare artifacts`,
	},
	{
		name: `Celebrity`,
		occupations: `Landlord, Famous Performer`,
		greatestExpense: `Land ownership, political leverage, personal chef, personal maid`,
	},
	{
		name: `Billionaire`,
		occupations: `Dictator, Monopolist`,
		greatestExpense: `Business aquisition`,
	},
]
