import * as Lucide from "lucide-react"
import { twMerge } from "tailwind-merge"
import { range } from "#app/common/range.js"
import { Tooltip } from "#app/ui/Tooltip.js"

export type DiceKind = {
	name: string
	element: JSX.Element
	faces: DiceFace[]
}

export type DiceFace = {
	element: JSX.Element
}

export const numericDiceKinds: DiceKind[] = [
	defineNumeric(4, <Lucide.Triangle />, twMerge("translate-y-[3px]")),
	defineNumeric(6, <Lucide.Square />),
	defineNumeric(8, <Lucide.Diamond />),
	defineNumeric(12, <Lucide.Pentagon />, twMerge("translate-y-[2px]")),
	defineNumeric(20, <Lucide.Hexagon />),
]

export const diceKinds: DiceKind[] = [
	...numericDiceKinds,
	defineModifier("boost", twMerge("text-green-400"), <Lucide.ChevronsUp absoluteStrokeWidth />, 1),
	defineModifier(
		"snag",
		twMerge("text-red-400"),
		<Lucide.X absoluteStrokeWidth className="scale-[0.8]" />,
		-1,
	),
]

export const diceKindsByName = new Map(diceKinds.map((kind) => [kind.name, kind]))

function defineNumeric(faceCount: number, icon: JSX.Element, textClassName?: string): DiceKind {
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
					text={`${name} - ${n}`}
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
		})),
	}
}

function defineModifier(
	name: string,
	className: string,
	icon: JSX.Element,
	effectDelta: number,
): DiceKind {
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
		faces: range.array(1, 7).map((n) => ({
			element: (
				<Tooltip
					text={`${name} - ${
						n >= doubleThreshold ? "2"
						: n >= singleThreshold ? "1"
						: "blank"
					} (${n})`}
					placement="top"
					className={twMerge(
						"flex-center-col relative transition [--icon-gap:9px] *:pointer-events-none hover:brightness-150",
						className,
					)}
				>
					<Lucide.Square className="size-full fill-primary-200 stroke-1" />
					{n >= doubleThreshold ?
						<>
							<div className="absolute left-[10px] top-[10px] size-[35%] *:size-full">{icon}</div>
							<div className="absolute bottom-[10px] right-[10px] size-[35%] *:size-full">
								{icon}
							</div>
						</>
					: n >= singleThreshold ?
						<div className="absolute size-[60%] *:size-full">{icon}</div>
					:	null}
				</Tooltip>
			),
		})),
	}
}
