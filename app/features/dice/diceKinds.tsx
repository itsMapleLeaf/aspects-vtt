import * as Lucide from "lucide-react"
import { twMerge } from "tailwind-merge"
import type { DiceInput } from "../../../convex/messages/types.ts"
import { range } from "../../common/range.ts"
import { Tooltip } from "../../ui/Tooltip.old.tsx"

export type DiceStat = {
	name: string
	min?: number
	className?: string
}

const effectStat = {
	name: "Effect",
	min: 1,
	className: twMerge("text-primary-800"),
}
const boostStat = { name: "Boost", className: twMerge("text-green-400") }
const snagStat = { name: "Snag", className: twMerge("text-red-400") }
export const diceStats: DiceStat[] = [effectStat, boostStat, snagStat]

export type DiceKind = {
	name: string
	element: React.ReactElement
	faces: DiceFace[]
	explodes: boolean
}

export type DiceFace = {
	element: React.ReactElement
	modifyStats: ReadonlyMap<DiceStat, number>
}

export function getDiceKindApiInput(kind: DiceKind, count: number): DiceInput {
	return {
		name: kind.name,
		sides: kind.faces.length,
		count,
		explodes: kind.explodes,
	}
}

export const statDiceKinds: DiceKind[] = [
	defineNumeric({
		faceCount: 4,
		icon: <Lucide.Triangle />,
		textClassName: twMerge("translate-y-[3px]"),
	}),
	defineNumeric({
		faceCount: 6,
		icon: <Lucide.Square />,
	}),
	defineNumeric({
		faceCount: 8,
		icon: <Lucide.Diamond />,
	}),
	defineNumeric({
		faceCount: 12,
		icon: <Lucide.Pentagon />,
		textClassName: twMerge("translate-y-[2px]"),
	}),
	defineNumeric({
		faceCount: 20,
		icon: <Lucide.Hexagon />,
	}),
]

export const numericDiceKinds: DiceKind[] = [
	...statDiceKinds,
	defineNumeric({
		faceCount: 100,
		icon: <Lucide.Octagon />,
	}),
]

export const snagDiceKind = defineModifier({
	name: "snag",
	className: twMerge("text-red-400"),
	icon: <Lucide.X absoluteStrokeWidth className="scale-[0.8]" />,
	multiplier: -1,
	stat: snagStat,
})
export const boostDiceKind = defineModifier({
	name: "boost",
	className: twMerge("text-green-400"),
	icon: <Lucide.ChevronsUp absoluteStrokeWidth />,
	multiplier: 1,
	stat: boostStat,
})
export const diceKinds: DiceKind[] = [
	...numericDiceKinds,
	boostDiceKind,
	snagDiceKind,
]

export const diceKindsByName = new Map(
	diceKinds.map((kind) => [kind.name, kind]),
)

function defineNumeric({
	faceCount,
	icon,
	textClassName,
}: {
	faceCount: number
	icon: React.ReactElement
	textClassName?: string
}): DiceKind {
	const name = `d${faceCount}`
	return {
		name,
		explodes: true,
		element: (
			<div className="flex-center-col relative text-primary-700 @container">
				<div className="size-full *:size-full *:fill-primary-200 *:stroke-1">
					{icon}
				</div>
				<p
					className={twMerge(
						"absolute text-[length:28cqw] font-semibold",
						textClassName,
					)}
				>
					d{faceCount}
				</p>
			</div>
		),
		faces: range.array(1, faceCount + 1).map((n) => ({
			element: (
				<Tooltip
					text={`${name}: ${n}`}
					placement="top"
					className="flex-center-col relative transition @container *:pointer-events-none hover:brightness-150 data-[max=true]:text-primary-700"
					data-max={n === faceCount}
				>
					<div className="size-full *:size-full *:fill-primary-200 *:stroke-1">
						{icon}
					</div>
					<p
						className={twMerge(
							"absolute text-[length:36cqw] font-semibold",
							textClassName,
						)}
					>
						{n}
					</p>
				</Tooltip>
			),
			modifyStats: new Map([[effectStat, n]]),
		})),
	}
}

function defineModifier({
	name,
	className,
	icon,
	multiplier,
	stat,
}: {
	name: string
	className: string
	icon: React.ReactElement
	multiplier: number
	stat: DiceStat
}): DiceKind {
	const faceCount = 4
	return {
		name,
		explodes: false,
		element: (
			<div className={twMerge("flex-center-col relative", className)}>
				<Lucide.Triangle className="size-full fill-primary-200 stroke-1" />
				<div className="absolute size-[50%] translate-y-[3px] *:size-full">
					{icon}
				</div>
			</div>
		),
		faces: range.array(1, faceCount + 1).map((face) => ({
			element: (
				<Tooltip
					text={`${name}: ${face}`}
					placement="top"
					className={twMerge(
						"flex-center-col relative transition @container [--icon-gap:9px] *:pointer-events-none hover:brightness-150",
						className,
					)}
				>
					<Lucide.Triangle className="size-full fill-primary-200 stroke-1" />
					<p className="absolute translate-y-[3px] text-[length:36cqw] font-semibold">
						{face}
					</p>
				</Tooltip>
			),
			modifyStats: new Map([
				[effectStat, face * multiplier],
				[stat, face],
			]),
		})),
	}
}
