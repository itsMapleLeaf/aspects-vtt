import { Iterator } from "iterator-helpers-polyfill"
import { diceKinds, getDiceKindApiInput } from "./data.tsx"

export function getDiceInputList(diceCounts: Record<string, number>) {
	return Iterator.from(diceKinds)
		.map((kind) => getDiceKindApiInput(kind, diceCounts[kind.name] ?? 0))
		.filter(({ count }) => count > 0)
}
