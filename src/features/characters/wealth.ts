export interface WealthTier {
	name: string
	occupations: string
	greatestExpense: string
	maxItemPrice: number
}

export const DEFAULT_WEALTH_TIER = 3

export const WEALTH_TIERS: WealthTier[] = [
	{
		name: `Homeless`,
		occupations: `Beggar, Thief`,
		greatestExpense: `trash, meal scraps, used and torn clothing`,
		maxItemPrice: 1,
	},
	{
		name: `Impoverished`,
		occupations: `Cave Miner, Prostitute, Unemployed Artist / Performer`,
		greatestExpense: `Common food or drink, used clothing, ferry ride, sturdy rope, unreliable tools, common raw materials, a dose of street drugs`,
		maxItemPrice: 10,
	},
	{
		name: `Lower Class`,
		occupations: `Store Clerk, Transport, Drifter`,
		greatestExpense: `Night at a nice restaurant, night at a cheap inn, light armor, entry to a club, new everyday clothes, uncommon raw materials`,
		maxItemPrice: 100,
	},
	{
		name: `Lower Middle Class`,
		occupations: `Protector, Farmer, Fisher, Smith, Artist / Performer`,
		greatestExpense: `Reliable tools, apartment for one, a small pet, comfy and durable clothes, rare materials, common artifacts`,
		maxItemPrice: 1_000,
	},
	{
		name: `Middle Class`,
		occupations: `Teacher, Business Owner, Construction Worker, Tailor`,
		greatestExpense: `Powerful tools, apartment for a few, a large or uncommon pet, strong armor`,
		maxItemPrice: 10_000,
	},
	{
		name: `Upper Middle Class`,
		occupations: `Master Craftsperson, Researcher`,
		greatestExpense: `luxury transport, established business, extravagant clothes, rare artifacts`,
		maxItemPrice: 50_000,
	},
	{
		name: `Upper Class`,
		occupations: `Politician, City Knight, Large Business Owner`,
		greatestExpense: `Nice house, bodyguard, personal chef, personal maid`,
		maxItemPrice: 100_000,
	},
	{
		name: `Celebrity`,
		occupations: `Landlord, Famous Performer`,
		greatestExpense: `A mansion, political leverage, hired assassins, very rare artifacts`,
		maxItemPrice: 1_000_000,
	},
	{
		name: `Oligarch`,
		occupations: `Dictator, Monopolist`,
		greatestExpense: `Land ownership, Business aquisition, mass encorporation`,
		maxItemPrice: 10_000_000,
	},
]
