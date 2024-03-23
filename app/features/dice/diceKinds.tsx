import * as Lucide from "lucide-react"
import { twMerge } from "tailwind-merge"
import { range } from "#app/common/range.js"
import { Tooltip } from "#app/ui/Tooltip.js"

export type DiceStat = {
	name: string
	className?: string
}

const effectStat = { name: "Effect", className: twMerge("text-primary-800") }
const boostStat = { name: "Boost", className: twMerge("text-green-400") }
const snagStat = { name: "Snag", className: twMerge("text-red-400") }
export const diceStats: DiceStat[] = [effectStat, boostStat, snagStat]

export type DiceKind = {
	name: string
	element: JSX.Element
	faces: DiceFace[]
}

export type DiceFace = {
	element: JSX.Element
	modifyStats: ReadonlyMap<DiceStat, number>
}

export const numericDiceKinds: DiceKind[] = [
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
export const diceKinds: DiceKind[] = [...numericDiceKinds, boostDiceKind, snagDiceKind]

export const diceKindsByName = new Map(diceKinds.map((kind) => [kind.name, kind]))

function defineNumeric({
	faceCount,
	icon,
	textClassName,
}: {
	faceCount: number
	icon: JSX.Element
	textClassName?: string
}): DiceKind {
	const name = `d${faceCount}`
	return {
		name,
		element: (
			<div className="flex-center-col @container relative text-primary-700">
				<div className="size-full *:size-full *:fill-primary-200 *:stroke-1">{icon}</div>
				<p className={twMerge("absolute text-[length:28cqw] font-semibold", textClassName)}>
					d{faceCount}
				</p>
			</div>
		),
		faces: range.array(1, faceCount + 1).map((n) => ({
			element: (
				<Tooltip
					text={`${name}: ${n}`}
					placement="top"
					className="@container flex-center-col relative transition *:pointer-events-none hover:brightness-150 data-[max=true]:text-primary-700"
					data-max={n === faceCount}
				>
					<div className="size-full *:size-full *:fill-primary-200 *:stroke-1">{icon}</div>
					<p className={twMerge("absolute text-[length:36cqw] font-semibold", textClassName)}>
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
	icon: JSX.Element
	multiplier: number
	stat: DiceStat
}): DiceKind {
	const faceCount = 6
	const doubleThreshold = faceCount
	const singleThreshold = faceCount - 2
	return {
		name,
		element: (
			<div className={twMerge("flex-center-col relative", className)}>
				<Lucide.Square className="size-full fill-primary-200 stroke-1" />
				<div className="absolute size-[50%] *:size-full">{icon}</div>
			</div>
		),
		faces: range.array(1, 7).map((faceNumber) => {
			let value
			if (faceNumber >= doubleThreshold) {
				value = 2
			} else if (faceNumber >= singleThreshold) {
				value = 1
			} else {
				value = 0
			}

			return {
				element: (
					<Tooltip
						text={`${name}: ${value} (face ${faceNumber})`}
						placement="top"
						className={twMerge(
							"flex-center-col relative transition [--icon-gap:9px] *:pointer-events-none hover:brightness-150",
							className,
						)}
					>
						<Lucide.Square className="size-full fill-primary-200 stroke-1" />
						{value === 2 ?
							<>
								<div className="absolute left-[10px] top-[10px] size-[35%] *:size-full">{icon}</div>
								<div className="absolute bottom-[10px] right-[10px] size-[35%] *:size-full">
									{icon}
								</div>
							</>
						: value === 1 ?
							<div className="absolute size-[60%] *:size-full">{icon}</div>
						:	null}
					</Tooltip>
				),
				modifyStats: new Map([
					[effectStat, value * multiplier],
					[stat, value],
				]),
			}
		}),
	}
}
