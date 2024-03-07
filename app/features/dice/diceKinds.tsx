import * as Lucide from "lucide-react"

export const defaultDiceKind = { sides: 20, icon: <Lucide.Hexagon />, textOffset: 0 }

export const diceKinds = [
	{ sides: 4, icon: <Lucide.Triangle />, textOffset: 3 },
	{ sides: 6, icon: <Lucide.Square />, textOffset: 0 },
	{ sides: 8, icon: <Lucide.Diamond />, textOffset: 0 },
	{ sides: 12, icon: <Lucide.Pentagon />, textOffset: 2 },
	defaultDiceKind,
]

export const diceKindsBySide = new Map(diceKinds.map((kind) => [kind.sides, kind]))
