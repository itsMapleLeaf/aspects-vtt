import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNow } from "date-fns"
import * as Lucide from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Fragment } from "react/jsx-runtime"
import { Button } from "~/components/Button.tsx"
import { FormButton } from "~/components/FormButton.tsx"
import { api } from "~/convex/_generated/api.js"
import { List } from "~/lib/list.ts"
import { useMergedRefs } from "~/lib/react/core.ts"
import { textArea } from "~/styles/input.ts"
import { lightPanel } from "~/styles/panel.ts"
import { DieIcon } from "../dice/DieIcon.tsx"
import { useRoomContext } from "../rooms/context.tsx"

type DiceOption = (typeof diceOptions)[number]
const diceOptions = [
	{ id: "d4", faces: 4 },
	{ id: "d6", faces: 6 },
	{ id: "d8", faces: 8 },
	{ id: "d10", faces: 10 },
	{ id: "d12", faces: 12 },
	{ id: "d100", faces: 100 },
	{ id: "boost", faces: 6, color: "green", label: "boost" },
	{ id: "snag", faces: 6, color: "red", label: "snag" },
]

export function MessageList() {
	const roomId = useRoomContext()._id
	const messages = useQuery(api.messages.list, { roomId })
	const latestMessageTimestamp = messages?.[0]?._creationTime
	const [animateRef] = useAutoAnimate()
	const listRef = useRef<HTMLDivElement | null>(null)
	const ref = useMergedRefs(animateRef, listRef)

	useEffect(() => {
		listRef.current!.scrollTo({
			top: listRef.current!.scrollHeight,
			behavior: "smooth",
		})
	}, [latestMessageTimestamp])

	const createMessage = useMutation(api.messages.create)

	const handleSend = async (text: string, dice: List<DiceOption>) => {
		const content = List.of(
			text.trim() ? { type: "text" as const, text } : undefined,
			dice.length > 0
				? {
						type: "dice" as const,
						dice: dice.map((die) => ({
							faces: die.faces,
							color: die.color,
						})),
					}
				: undefined,
		).compact()

		if (content.length === 0) {
			return
		}

		await createMessage({
			roomId,
			content,
		})
	}

	return (
		<div className="flex h-full flex-col gap-2">
			<div
				className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
				ref={ref}
			>
				{messages
					?.toReversed()
					.map((message) => (
						<MessageCard key={message._id} message={message} />
					))}
			</div>
			<MessageInput onSend={handleSend} />
		</div>
	)
}

interface MessageInputProps {
	onSend: (text: string, dice: List<DiceOption>) => Promise<void>
}

function MessageInput({ onSend }: MessageInputProps) {
	const [messageText, setMessageText] = useState("")
	const [messageDice, setMessageDice] = useState(List.of<DiceOption>())

	const handleSend = async () => {
		await onSend(messageText, messageDice)
		setMessageText("")
		setMessageDice(List.of())
	}

	return (
		<div className="flex flex-col gap-1">
			<textarea
				className={textArea()}
				rows={2}
				value={messageText}
				onChange={(event) => setMessageText(event.currentTarget.value)}
				onKeyDown={(event) => {
					if (event.key === "Enter" && !event.ctrlKey && !event.shiftKey) {
						event.preventDefault()
						handleSend()
					}
				}}
			/>
			<div className="gap grid auto-cols-fr grid-flow-col">
				<Button
					icon={<Lucide.RotateCcw />}
					size="small"
					onClick={() => setMessageDice(List.of())}
				>
					Clear dice
				</Button>
				<FormButton action={handleSend} icon={<Lucide.Send />} size="small">
					Send
				</FormButton>
			</div>
			<div className="gap flex flex-wrap items-center justify-center">
				{diceOptions.map((opt) => {
					const count = messageDice.count(opt)
					return (
						<Button
							key={opt.id}
							appearance={count > 0 ? "solid" : "clear"}
							icon={
								<DieIcon
									faces={opt.faces}
									color={opt.color}
									label={opt.label}
									value={count > 0 ? count : null}
									className="w-8"
								/>
							}
							className="h-auto px-1.5! py-0.5!"
							onClick={() => {
								setMessageDice((dice) => List.of(...dice, opt))
							}}
							onContextMenu={(event) => {
								event.preventDefault()
								setMessageDice((dice) => {
									const index = dice.findIndex((it) => it.id === opt.id)
									return index !== -1
										? List.from(dice.toSpliced(index, 1))
										: dice
								})
							}}
						/>
					)
				})}
			</div>
		</div>
	)
}

function MessageCard({
	message,
}: {
	message: FunctionReturnType<typeof api.messages.list>[number]
}) {
	const characters = useQuery(api.characters.list, {
		roomId: message.roomId,
	})
	const namesById = new Map(characters?.map((it) => [it._id, it.name]))
	return (
		<div className={lightPanel("flex flex-col gap-2 p-2")}>
			{message.content.map((entry, index) => (
				<Fragment key={index}>
					{entry.type === "text" ? (
						<p>
							{entry.text.replaceAll(
								/<@([a-z0-9]+?)>/gi,
								(_, id) => namesById.get(id) ?? "(unknown)",
							)}
						</p>
					) : (
						<aside className="flex flex-wrap items-center gap-1">
							<ul className="contents">
								{entry.dice
									.sort((a, b) => a.faces - b.faces)
									.sort((a, b) =>
										(a.color ?? "default").localeCompare(b.color ?? "default"),
									)
									.map((die, index) => (
										<li key={index}>
											<DieIcon {...die} value={die.result} />
										</li>
									))}
							</ul>
							{entry.dice.length > 1 && (
								<>
									<Lucide.Equal aria-hidden />
									<p className="text-xl font-medium">
										{entry.dice.reduce(
											(total, die) =>
												total +
												(die.operation === "subtract"
													? -die.result
													: die.result),
											0,
										)}
									</p>
								</>
							)}
						</aside>
					)}
				</Fragment>
			))}
			<p className="text-primary-400 text-sm font-bold">
				{message.author.name} •{" "}
				<time dateTime={new Date(message._creationTime).toISOString()}>
					{formatDistanceToNow(message._creationTime, { addSuffix: true })}
				</time>
			</p>
		</div>
	)
}
