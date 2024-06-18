import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { twMerge } from "tailwind-merge"
import type { DiceInput } from "../../../convex/messages/types.ts"
import { Tooltip } from "../../ui/Tooltip.old.tsx"

export interface DiceStat {
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

export interface DiceKind {
	name: string
	faces: DiceFace[]
	explodes?: boolean
	render: () => React.ReactElement
}

export interface DiceFace {
	modifyStats: ReadonlyMap<DiceStat, number>
	render: () => React.ReactElement
}

export function getDiceKindApiInput(kind: DiceKind, count: number): DiceInput {
	return {
		name: kind.name,
		sides: kind.faces.length,
		count,
		explodes: kind.explodes,
	}
}

export const statDiceKindsByName = {
	d4: defineNumeric({
		faceCount: 4,
		renderIcon: () => <Lucide.Triangle />,
		textClassName: twMerge("translate-y-[3px]"),
	}),
	d6: defineNumeric({
		faceCount: 6,
		renderIcon: () => <Lucide.Square />,
	}),
	d8: defineNumeric({
		faceCount: 8,
		renderIcon: () => <Lucide.Diamond />,
	}),
	d12: defineNumeric({
		faceCount: 12,
		renderIcon: () => <Lucide.Pentagon />,
		textClassName: twMerge("translate-y-[2px]"),
	}),
	d20: defineNumeric({
		faceCount: 20,
		renderIcon: () => <Lucide.Hexagon />,
	}),
}

export const statDiceKinds = Object.values(statDiceKindsByName)

export const numericDiceKinds: DiceKind[] = [
	...statDiceKinds,
	defineNumeric({
		faceCount: 100,
		renderIcon: () => <Lucide.Octagon />,
	}),
]

export const snagDiceKind = defineModifier({
	name: "snag",
	className: twMerge("text-red-400"),
	renderIcon: () => <Lucide.X absoluteStrokeWidth className="scale-[0.8]" />,
	multiplier: -1,
	stat: snagStat,
})
export const boostDiceKind = defineModifier({
	name: "boost",
	className: twMerge("text-green-400"),
	renderIcon: () => <Lucide.ChevronsUp absoluteStrokeWidth />,
	multiplier: 1,
	stat: boostStat,
})
export const diceKinds: DiceKind[] = [...numericDiceKinds, boostDiceKind, snagDiceKind]

export const diceKindsByName = new Map(diceKinds.map((kind) => [kind.name, kind]))

function defineNumeric({
	faceCount,
	renderIcon,
	textClassName,
}: {
	faceCount: number
	renderIcon: () => React.ReactElement
	textClassName?: string
}): DiceKind {
	const name = `d${faceCount}`
	return {
		name,
		render: () => (
			<div className="flex-center-col relative text-primary-700 @container">
				<div className="size-full *:size-full *:fill-primary-200 *:stroke-1">{renderIcon()}</div>
				<p
					className={twMerge(
						"absolute hidden text-[length:28cqw] font-semibold @[3rem]:block",
						textClassName,
					)}
				>
					d{faceCount}
				</p>
			</div>
		),
		faces: Iterator.range(1, faceCount + 1)
			.map((n) => ({
				render: () => (
					<Tooltip
						text={`${name}: ${n}`}
						placement="top"
						className="flex-center-col relative transition @container *:pointer-events-none hover:brightness-150 data-[max=true]:text-primary-700"
						data-max={n === faceCount}
					>
						<div className="size-full *:size-full *:fill-primary-200 *:stroke-1">
							{renderIcon()}
						</div>
						<p className={twMerge("absolute text-[length:36cqw] font-semibold", textClassName)}>
							{n}
						</p>
					</Tooltip>
				),
				modifyStats: new Map([[effectStat, n]]),
			}))
			.toArray(),
	}
}

function defineModifier({
	name,
	className,
	renderIcon,
	multiplier,
	stat,
}: {
	name: string
	className: string
	renderIcon: () => React.ReactElement
	multiplier: number
	stat: DiceStat
}): DiceKind {
	const faceCount = 4
	return {
		name,
		render: () => (
			<div className={twMerge("flex-center-col relative", className)}>
				<Lucide.Triangle className="size-full fill-primary-200 stroke-1" />
				<div className="absolute hidden size-[50%] translate-y-[3px] *:size-full @[3rem]:block">
					{renderIcon()}
				</div>
			</div>
		),
		faces: Iterator.range(1, faceCount + 1)
			.map((face) => ({
				modifyStats: new Map([
					[effectStat, face * multiplier],
					[stat, face],
				]),
				render: () => (
					<Tooltip
						text={`${name}: ${face}`}
						placement="top"
						className={twMerge(
							"flex-center-col relative transition @container [--icon-gap:9px] *:pointer-events-none hover:brightness-150",
							className,
						)}
					>
						<Lucide.Triangle className="size-full fill-primary-200 stroke-1" />
						<p className="absolute translate-y-[3px] text-[length:36cqw] font-semibold">{face}</p>
					</Tooltip>
				),
			}))
			.toArray(),
	}
}
