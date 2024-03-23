import { type PaginatedQueryItem, usePaginatedQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import { HelpCircle } from "lucide-react"
import { Virtuoso } from "react-virtuoso"
import { Loading } from "#app/ui/Loading.tsx"
import { Tooltip } from "#app/ui/Tooltip.js"
import { api } from "#convex/_generated/api.js"
import { useRoom } from "../rooms/roomContext.tsx"
import { diceKinds, diceKindsByName } from "./diceKinds"

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
			style={{ height: "100%", willChange: "transform" }}
			data={list.results}
			itemContent={(_index, roll) => (
				<div className="pb-2 animate-in fade-in">
					<DiceRollSummary roll={roll} />
				</div>
			)}
			defaultItemHeight={135}
			endReached={() => list.loadMore(numItems)}
			components={{
				Footer: () =>
					list.status === "Exhausted" ?
						null
					:	<div className="flex justify-center p-4">
							<Loading />
						</div>,
			}}
		/>
	)
}

function DiceRollSummary({ roll }: { roll: PaginatedQueryItem<typeof api.diceRolls.list> }) {
	const diceResultsByKindName = new Map<string, (typeof roll)["dice"]>()
	for (const die of roll.dice) {
		const dice = diceResultsByKindName.get(die.name) ?? []
		dice.push(die)
		diceResultsByKindName.set(die.name, dice)
	}
	return (
		<li
			key={roll._id}
			className="flex flex-col gap-1 rounded border border-primary-300 bg-primary-200/50 px-3 py-2"
		>
			<h3 className="text-xl/tight font-light empty:hidden">{roll.label}</h3>
			<ul className="-mx-1.5 flex flex-wrap">
				{diceKinds
					.flatMap((kind) => diceResultsByKindName.get(kind.name) ?? [])
					.map((die) => (
						<DiceRollIcon key={die.key} die={die} />
					))}
			</ul>
			<p className="leading-tight text-primary-600">
				rolled by{" "}
				<strong className="font-medium text-primary-900">
					{roll.rolledBy ? roll.rolledBy.name : <span className="opacity-50">unknown user</span>}
				</strong>{" "}
				{formatDistanceToNow(new Date(roll._creationTime), { addSuffix: true })}
			</p>
		</li>
	)
}

function DiceRollIcon({
	die,
}: {
	die: PaginatedQueryItem<typeof api.diceRolls.list>["dice"][number]
}) {
	const kind = diceKindsByName.get(die.name)
	return (
		<div className="*:size-12">
			{kind == null ?
				<Tooltip text={`Unknown dice type "${die.name}"`}>
					<HelpCircle />
				</Tooltip>
			:	kind.faces[die.result - 1]?.element ?? (
					<Tooltip text={`Unknown face "${die.result}" on d${die.name}`}>
						<HelpCircle />
					</Tooltip>
				)
			}
		</div>
	)
}
