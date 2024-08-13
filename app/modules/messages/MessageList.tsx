import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNow } from "date-fns"
import { HelpCircle } from "lucide-react"
import { Fragment, useEffect } from "react"
import { api } from "../../../convex/_generated/api.js"
import { chunk } from "../../helpers/array.ts"
import { TranslucentPanel } from "../../ui/Panel.tsx"
import { Tooltip } from "../../ui/Tooltip.old.tsx"
import { panel } from "../../ui/styles.ts"
import { hasFullCharacterPermissions } from "../characters/helpers.ts"
import {
	type DiceStat,
	diceKinds,
	diceKindsByName,
	diceStats,
} from "../dice/data.tsx"
import { useCharacters, useRoom } from "../rooms/roomContext.tsx"

type ApiMessage = FunctionReturnType<typeof api.messages.functions.list>[number]

export function MessageList({
	onMessageAdded,
}: {
	onMessageAdded: () => void
}) {
	const room = useRoom()
	const messages = useQuery(api.messages.functions.list, { roomId: room._id })
	const [animateRef] = useAutoAnimate()

	const lastMessageId = messages?.[0]?._id
	useEffect(() => {
		if (lastMessageId) {
			onMessageAdded()
		}
	}, [lastMessageId, onMessageAdded])

	return (
		<ul className="flex h-fit flex-col gap-2" ref={animateRef}>
			{messages?.toReversed().map((message) => (
				<li key={message._id}>
					<MessagePanel message={message} />
				</li>
			))}
		</ul>
	)
}

function MessagePanel({ message }: { message: ApiMessage }) {
	return (
		<TranslucentPanel className="flex flex-col p-3 gap-1.5">
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
			<p className="flex text-sm font-medium leading-tight tracking-wide text-primary-600 gap-1">
				<span>{message.user?.name}</span>
				<span className="first:hidden">•</span>
				{formatDistanceToNow(new Date(message._creationTime), {
					addSuffix: true,
				})}
			</p>
		</TranslucentPanel>
	)
}

// function MessageMenu(props: { message: ApiMessage; children: React.ReactNode }) {
// 	// const sceneContext = useSceneContext()
// 	const updateCharacter = useMutation(api.characters.functions.update)
// 	const diceTotal = props.message.diceRoll?.dice.reduce((total, it) => total + it.result, 0) ?? 0

// 	function updateCharacters(
// 		getArgs: (character: ApiCharacter) => Partial<Parameters<typeof updateCharacter>[0]>,
// 	) {
// 		// for (const character of sceneContext.selectedCharacters()) {
// 		// 	updateCharacter({ ...getArgs(character), id: character._id })
// 		// }
// 	}

// 	return (
// 		<MoreMenu>
// 			{props.children}
// 			<MoreMenuPanel>
// 				<MoreMenuItem
// 					icon={<Lucide.Heart />}
// 					text="Heal selected characters"
// 					onClick={() => {
// 						updateCharacters((it) => ({ damage: it.damage - diceTotal }))
// 					}}
// 				/>
// 				<MoreMenuItem
// 					icon={<Lucide.HeartCrack />}
// 					text="Damage selected characters"
// 					onClick={() => {
// 						updateCharacters((it) => ({ damage: it.damage + diceTotal }))
// 					}}
// 				/>
// 				<MoreMenuItem
// 					icon={<Lucide.Zap />}
// 					text="Refresh selected characters"
// 					onClick={() => {
// 						updateCharacters((it) => ({ fatigue: it.fatigue - diceTotal }))
// 					}}
// 				/>
// 				<MoreMenuItem
// 					icon={<Lucide.ZapOff />}
// 					text="Exhaust selected characters"
// 					onClick={() => {
// 						updateCharacters((it) => ({ fatigue: it.fatigue + diceTotal }))
// 					}}
// 				/>
// 			</MoreMenuPanel>
// 		</MoreMenu>
// 	)
// }

type ApiDiceRoll = NonNullable<ApiMessage["diceRoll"]>

function DiceRollSummary({ roll }: { roll: ApiDiceRoll }) {
	const diceResultsByKindName = new Map<string, ApiDiceRoll["dice"]>()
	for (const die of roll.dice) {
		const dice = diceResultsByKindName.get(die.name) ?? []
		dice.push(die)
		diceResultsByKindName.set(die.name, dice)
	}

	const statValues = new Map<DiceStat, number>()
	for (const die of roll.dice) {
		const kind = diceKindsByName.get(die.name)
		for (const [stat, value] of kind?.faces[die.result - 1]?.modifyStats ??
			[]) {
			statValues.set(stat, (statValues.get(stat) ?? 0) + value)
		}
	}

	return (
		<div>
			<dl className="flex gap-1.5">
				{diceStats
					.filter((stat) => statValues.has(stat))
					.map((stat) => ({
						stat,
						value: Math.max(stat.min ?? 0, statValues.get(stat) ?? 0),
					}))
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
						<li key={die.key} className="*:size-12">
							<DiceRollIcon die={die} />
						</li>
					))}
			</ul>
		</div>
	)
}

function DiceRollIcon({ die }: { die: ApiDiceRoll["dice"][number] }) {
	const kind = diceKindsByName.get(die.name)
	const face = kind?.faces[die.result - 1]
	return (
		kind == null ?
			<Tooltip
				text={`Unknown dice type "${die.name}"`}
				className="flex-center-col"
			>
				<HelpCircle />
			</Tooltip>
		: face == null ?
			<Tooltip
				text={`Unknown face "${die.result}" on ${die.name}`}
				className="flex-center-col"
			>
				<HelpCircle />
			</Tooltip>
		:	<face.Component />
	)
}

function MessageContent({ content }: { content: string }) {
	return chunk(content.split(/(<@[\da-z]+>)/gi), 2).map(
		([text, mention], index) => {
			const characterId =
				mention ? mention.slice(2, mention.length - 1) : undefined
			return (
				<Fragment key={index}>
					<span>{text}</span>
					{characterId && <Mention characterId={characterId} />}
				</Fragment>
			)
		},
	)
}

function Mention({ characterId }: { characterId: string }) {
	const character = useCharacters().find((c) => c._id === characterId)
	return (
		<button
			type="button"
			className="inline-block rounded border border-primary-500 bg-primary-700/25 px-1.5 py-1 leading-none transition hover:bg-primary-700/50 active:bg-primary-700/75 active:duration-0"
			onClick={() => {
				if (!character) return
				// todo: select the token on the map
			}}
		>
			{character && hasFullCharacterPermissions(character) ?
				character.name
			:	"???"}
		</button>
	)
}
