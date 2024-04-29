import { type PaginatedQueryItem, useMutation, usePaginatedQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import { HelpCircle } from "lucide-react"
import * as Lucide from "lucide-react"
import { Fragment } from "react"
import { Virtuoso } from "react-virtuoso"
import { chunk } from "#app/common/array.js"
import {
	ContextMenu,
	ContextMenuItem,
	ContextMenuPanel,
	ContextMenuTrigger,
} from "#app/ui/ContextMenu.js"
import { Loading } from "#app/ui/Loading.tsx"
import { Tooltip } from "#app/ui/Tooltip.old.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import type { ApiCharacter } from "../characters/types.ts"
import { type DiceStat, diceKinds, diceKindsByName, diceStats } from "../dice/diceKinds.tsx"
import { useCharacters, useRoom } from "../rooms/roomContext.tsx"
import { useSceneContext } from "../scenes/SceneContext.tsx"
import { tokenSelectedEvent } from "../tokens/events.ts"

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
					<MessagePanel message={message} />
				</div>
			)}
			defaultItemHeight={135}
			endReached={() => list.loadMore(listItemCount)}
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

type ApiMessage = PaginatedQueryItem<typeof api.messages.list>

function MessagePanel({ message }: { message: ApiMessage }) {
	return (
		<MessageMenu message={message}>
			<div className={panel("flex flex-col gap-1.5 p-3")}>
				{message.content && (
					<p className="text-lg empty:hidden">
						<MessageContent content={message.content} />
					</p>
				)}
				{message.diceRoll && message.diceRoll.dice.length > 0 && (
					<div className={panel("bg-primary-100/50 px-3 py-2")}>
						<DiceRollSummary roll={message.diceRoll} />
					</div>
				)}
				<div className="text-sm font-medium leading-tight tracking-wide">
					{message.user?.character && (
						<p className="text-primary-900">
							{message.user.character.displayName} ({message.user.character.displayPronouns})
						</p>
					)}
					<p className="flex gap-1 text-primary-600">
						<span>{message.user?.name}</span>
						<span className="first:hidden">•</span>
						{formatDistanceToNow(new Date(message._creationTime), { addSuffix: true })}
					</p>
				</div>
			</div>
		</MessageMenu>
	)
}

function MessageMenu(props: { message: ApiMessage; children: React.ReactNode }) {
	const sceneContext = useSceneContext()
	const updateCharacter = useMutation(api.characters.update)
	const diceTotal = props.message.diceRoll?.dice.reduce((total, it) => total + it.result, 0) ?? 0

	function updateCharacters(
		getArgs: (character: ApiCharacter) => Partial<Parameters<typeof updateCharacter>[0]>,
	) {
		for (const character of sceneContext.selectedCharacters()) {
			updateCharacter({ ...getArgs(character), id: character._id })
		}
	}

	return (
		<ContextMenu>
			<ContextMenuTrigger>{props.children}</ContextMenuTrigger>
			<ContextMenuPanel>
				<ContextMenuItem
					icon={<Lucide.Heart />}
					text="Heal selected characters"
					onClick={() => {
						updateCharacters((it) => ({ damage: it.damage - diceTotal }))
					}}
				/>
				<ContextMenuItem
					icon={<Lucide.HeartCrack />}
					text="Damage selected characters"
					onClick={() => {
						updateCharacters((it) => ({ damage: it.damage + diceTotal }))
					}}
				/>
				<ContextMenuItem
					icon={<Lucide.Zap />}
					text="Refresh selected characters"
					onClick={() => {
						updateCharacters((it) => ({ fatigue: it.fatigue - diceTotal }))
					}}
				/>
				<ContextMenuItem
					icon={<Lucide.ZapOff />}
					text="Exhaust selected characters"
					onClick={() => {
						updateCharacters((it) => ({ fatigue: it.fatigue + diceTotal }))
					}}
				/>
			</ContextMenuPanel>
		</ContextMenu>
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
			<dl className="flex gap-1.5">
				{diceStats
					.filter((stat) => statValues.has(stat))
					.map((stat) => ({ stat, value: Math.max(stat.min ?? 0, statValues.get(stat) ?? 0) }))
					.filter(({ value }) => value > 0)
					.map(({ stat, value }, index) => (
						<Fragment key={stat.name}>
							{index > 0 && (
								<span className="text-primary-400" aria-hidden>
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
			{kind == null ? (
				<Tooltip text={`Unknown dice type "${die.name}"`} className="flex-center-col">
					<HelpCircle />
				</Tooltip>
			) : (
				kind.faces[die.result - 1]?.element ?? (
					<Tooltip text={`Unknown face "${die.result}" on ${die.name}`} className="flex-center-col">
						<HelpCircle />
					</Tooltip>
				)
			)}
		</div>
	)
}

function MessageContent({ content }: { content: string }) {
	return chunk(content.split(/(<@[\da-z]+>)/gi), 2).map(([text, mention], index) => {
		const characterId = mention ? mention.slice(2, mention.length - 1) : undefined
		return (
			<Fragment key={index}>
				<span>{text}</span>
				{characterId && <Mention characterId={characterId} />}
			</Fragment>
		)
	})
}

function Mention({ characterId }: { characterId: string }) {
	const character = useCharacters().find((c) => c._id === characterId)
	return (
		<button
			type="button"
			className="inline-block rounded border border-primary-500 bg-primary-700/25 px-1.5 py-1 leading-none transition hover:bg-primary-700/50 active:bg-primary-700/75 active:duration-0"
			onClick={() => {
				if (!character) return
				tokenSelectedEvent.emit(character._id)
			}}
		>
			{character ? character.displayName : "unknown character"}
		</button>
	)
}
