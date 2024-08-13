import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import type React from "react"
import { useMemo } from "react"
import { twMerge } from "tailwind-merge"
import type { DiceInput } from "../../../convex/messages/types.ts"
import { Tooltip } from "../../ui/Tooltip.tsx"

export interface DiceStat {
	name: string
	min?: number
	className?: string
}

export interface DiceKind {
	name: string
	faces: DiceFace[]
	explodes?: boolean
	Component: () => React.ReactElement
}

export interface DiceFace {
	modifyStats: ReadonlyMap<DiceStat, number>
	Component: () => React.ReactElement
}

const effectStat = {
	name: "Effect",
	min: 1,
	className: twMerge("text-primary-800"),
} satisfies DiceStat
const baseStat = {
	name: "Base",
	className: twMerge("text-blue-400"),
} satisfies DiceStat
const boostStat = {
	name: "Boost",
	className: twMerge("text-green-400"),
} satisfies DiceStat
const snagStat = {
	name: "Snag",
	className: twMerge("text-red-400"),
} satisfies DiceStat
export const diceStats: DiceStat[] = [effectStat, baseStat, boostStat, snagStat]

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
	d10: defineNumeric({
		faceCount: 10,
		renderIcon: () => <Lucide.Hexagon />,
	}),
	d12: defineNumeric({
		faceCount: 12,
		renderIcon: () => <Lucide.Pentagon />,
		textClassName: twMerge("translate-y-[2px]"),
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
		Component: function NumericDie() {
			return useMemo(
				() => (
					<Diecon
						shape={renderIcon()}
						symbol={
							<p
								className={twMerge(
									"text-[length:28cqw] font-semibold",
									textClassName,
								)}
							>
								d{faceCount}
							</p>
						}
						tooltip={name}
					/>
				),
				[faceCount, renderIcon, textClassName],
			)
		},
		faces: Iterator.range(1, faceCount + 1)
			.map((n) => ({
				Component: function NumericDieFace() {
					return useMemo(
						() => (
							<Diecon
								shape={renderIcon()}
								symbol={
									<p
										className={twMerge(
											"text-[length:36cqw] font-semibold",
											textClassName,
										)}
									>
										{n}
									</p>
								}
								tooltip={`${name}: ${n}`}
								className={n === faceCount ? "text-primary-700" : ""}
							/>
						),
						[faceCount, renderIcon, n, textClassName],
					)
				},
				modifyStats: new Map([
					[effectStat, n],
					[baseStat, n],
				]),
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
	const faceCount = 6
	return {
		name,
		Component: function ModifierDie() {
			return useMemo(
				() => (
					<Diecon
						shape={<Lucide.Square />}
						symbol={renderIcon()}
						tooltip={name}
						className={className}
					/>
				),
				[name, className, renderIcon],
			)
		},
		faces: Iterator.range(1, faceCount + 1)
			.map((face) => ({
				modifyStats: new Map([
					[effectStat, face * multiplier],
					[stat, face],
				]),
				Component: function ModifierDieFace() {
					return useMemo(
						() => (
							<Diecon
								shape={<Lucide.Square />}
								symbol={
									<p className="text-[length:36cqw] font-semibold">{face}</p>
								}
								tooltip={`${name}: ${face}`}
								className={className}
							/>
						),
						[className, face, name],
					)
				},
			}))
			.toArray(),
	}
}

function Diecon({
	shape,
	symbol,
	tooltip,
	className,
}: {
	shape: React.ReactNode
	symbol: React.ReactNode
	tooltip: React.ReactNode
	className?: string
}) {
	return (
		<Tooltip content={tooltip}>
			<div
				className={twMerge(
					"flex-center-col relative size-full cursor-default transition @container hover:brightness-150",
					className,
				)}
			>
				<div className="relative size-full *:size-full *:fill-primary-200 *:stroke-1">
					{shape}
				</div>
				<div className="absolute hidden *:size-full @[3rem]:block">
					{symbol}
				</div>
			</div>
		</Tooltip>
	)
}
