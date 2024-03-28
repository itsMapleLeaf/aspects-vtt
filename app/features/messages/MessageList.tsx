import { type PaginatedQueryItem, usePaginatedQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import { HelpCircle } from "lucide-react"
import { Fragment } from "react"
import { Virtuoso } from "react-virtuoso"
import { Loading } from "#app/ui/Loading.tsx"
import { Tooltip } from "#app/ui/Tooltip.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import { type DiceStat, diceKinds, diceKindsByName, diceStats } from "../dice/diceKinds.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function MessageList() {
	const room = useRoom()

	const listItemCount = 20
	const list = usePaginatedQuery(
		api.messages.list,
		{ roomId: room._id },
		{ initialNumItems: listItemCount },
	)

	return (
		<Virtuoso
			style={{ height: "100%", willChange: "transform" }}
			data={list.results}
			itemContent={(_index, message) => (
				<div className="pb-2 animate-in fade-in">
					<div className={panel("flex flex-col gap-1.5 p-3")}>
						{message.content && <p className="text-lg empty:hidden">{message.content}</p>}
						{message.diceRoll && (
							<div className={panel("bg-primary-100/50 px-3 py-2")}>
								<DiceRollSummary roll={message.diceRoll} />
							</div>
						)}
						<aside className="flex gap-0.5 text-sm font-medium leading-tight tracking-wide text-primary-600">
							{message.user?.character?.name ?
								<>
									<span className="text-primary-900">{message.user.character.name}</span> (
									{message.user.name})
								</>
							:	<span>{message.user?.name}</span>}
							<span className="first:hidden">•</span>
							{formatDistanceToNow(new Date(message._creationTime), { addSuffix: true })}
						</aside>
					</div>
				</div>
			)}
			defaultItemHeight={135}
			endReached={() => list.loadMore(listItemCount)}
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

type DiceRoll = NonNullable<PaginatedQueryItem<typeof api.messages.list>["diceRoll"]>

function DiceRollSummary({ roll }: { roll: DiceRoll }) {
	const diceResultsByKindName = new Map<string, DiceRoll["dice"]>()
	for (const die of roll.dice) {
		const dice = diceResultsByKindName.get(die.name) ?? []
		dice.push(die)
		diceResultsByKindName.set(die.name, dice)
	}

	const statValues = new Map<DiceStat, number>()
	for (const die of roll.dice) {
		const kind = diceKindsByName.get(die.name)
		for (const [stat, value] of kind?.faces[die.result - 1]?.modifyStats ?? []) {
			statValues.set(stat, (statValues.get(stat) ?? 0) + value)
		}
	}

	return (
		<div>
			<dl className="flex gap-[2px]">
				{diceStats
					.map((stat) => ({ stat, value: Math.max(0, statValues.get(stat) ?? 0) }))
					.filter(({ value }) => value > 0)
					.map(({ stat, value }, index) => (
						<Fragment key={stat.name}>
							{index > 0 && (
								<span className="opacity-30" aria-hidden>
									•
								</span>
							)}
							<div className={stat.className}>
								<dt className="inline">{stat.name}:</dt>{" "}
								<dd className="inline font-semibold">{value}</dd>
							</div>
						</Fragment>
					))}
			</dl>
			<ul className="-mx-1.5 flex flex-wrap">
				{diceKinds
					.flatMap((kind) => diceResultsByKindName.get(kind.name) ?? [])
					.map((die) => (
						<li key={die.key}>
							<DiceRollIcon die={die} />
						</li>
					))}
			</ul>
		</div>
	)
}

function DiceRollIcon({ die }: { die: DiceRoll["dice"][number] }) {
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
