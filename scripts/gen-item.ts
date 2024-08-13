import { randomItem } from "../common/random"

const itemTypes = ["Consumable", "Equipment", "Tool"]

const itemQualities = [
	{
		name: "Boost",
		variants: ["Strength", "Mobility", "Sense", "Intelligence", "Wit"],
		levels: [
			...Array<number>(10).fill(1),
			...Array<number>(7).fill(2),
			...Array<number>(3).fill(3),
		],
	},
	{
		name: "Restoring",
		variants: ["Health", "Resolve"],
		levels: [
			...Array<number>(8).fill(1),
			...Array<number>(5).fill(2),
			...Array<number>(4).fill(3),
			...Array<number>(2).fill(4),
			...Array<number>(1).fill(5),
		],
	},
	{
		name: "Energize",
		levels: [...Array<number>(16).fill(1), ...Array<number>(3).fill(2), 3],
	},
	{
		name: "Mobilize",
		levels: [
			...Array<number>(1).fill(3),
			...Array<number>(2).fill(5),
			...Array<number>(3).fill(8),
			...Array<number>(4).fill(10),
		],
	},
	{
		name: "Strengthen",
		levels: [
			...Array<number>(8).fill(4),
			...Array<number>(5).fill(8),
			...Array<number>(4).fill(10),
			...Array<number>(2).fill(12),
			...Array<number>(1).fill(16),
		],
	},
]

const itemCount = Number(process.argv[2] ?? "10")

const generated = []
for (let i = 0; i < itemCount; i++) {
	const quality = randomItem(itemQualities)!
	const item = {
		type: randomItem(itemTypes),
		quality: quality.name,
		variant: quality.variants ? randomItem(quality.variants) : undefined,
		level: randomItem(quality.levels),
	}
	generated.push(item)
}
