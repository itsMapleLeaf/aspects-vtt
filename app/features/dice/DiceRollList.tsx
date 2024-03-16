import { usePaginatedQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import type { CSSProperties } from "react"
import { Virtuoso } from "react-virtuoso"
import { Loading } from "#app/ui/Loading.tsx"
import { api } from "#convex/_generated/api.js"
import type { Doc } from "#convex/_generated/dataModel.js"
import { useRoom } from "../rooms/useRoom.tsx"
import { defaultDiceKind, diceKindsBySide } from "./diceKinds"

export function DiceRollList() {
	const room = useRoom()
	const numItems = 20
	const list = usePaginatedQuery(
		api.diceRolls.list,
		{ roomId: room._id },
		{ initialNumItems: numItems },
	)
	return (
		<Virtuoso
			style={{ height: "100%" }}
			data={list.results}
			itemContent={(_index, roll) => (
				<div className="fade-in animate-in pb-2">
					<DiceRollSummary roll={roll} />
				</div>
			)}
			defaultItemHeight={135}
			endReached={() => list.loadMore(numItems)}
			components={{
				Footer: () =>
					list.status === "Exhausted" ? null : (
						<div className="flex justify-center p-4">
							<Loading />
						</div>
					),
			}}
		/>
	)
}

function DiceRollSummary({ roll }: { roll: Doc<"diceRolls"> }) {
	return (
		<li
			key={roll._id}
			className="flex flex-col gap-1 rounded border border-primary-300 bg-primary-200 px-3 py-2"
		>
			<h3 className="font-light text-xl/tight empty:hidden">{roll.label}</h3>
			<ul className="-mx-1.5 flex flex-wrap">
				{roll.dice.map((die) => (
					<DiceRollIcon key={die.key} die={die} />
				))}
			</ul>
			<p className="text-primary-600 leading-tight">
				rolled by <strong className="font-medium text-primary-900">{roll.author}</strong>{" "}
				{formatDistanceToNow(new Date(roll._creationTime), { addSuffix: true })}
			</p>
		</li>
	)
}

function DiceRollIcon({ die }: { die: { sides: number; outcome: number } }) {
	const kind = diceKindsBySide.get(die.sides) ?? defaultDiceKind
	const style = { "--text-offset": `${kind.textOffset}px` } as CSSProperties
	return (
		<div className="relative flex items-center justify-center">
			<div className="*:size-16 *:fill-primary-300 *:stroke-1">{kind.icon}</div>
			<div
				style={style}
				className="absolute flex translate-y-[--text-offset] flex-col items-center"
			>
				<p className="font-medium text-xl/none">{die.outcome}</p>
				<p className="text-primary-800 text-sm/none">d{die.sides}</p>
			</div>
		</div>
	)
}
