import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNow } from "date-fns"
import * as Lucide from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Fragment } from "react/jsx-runtime"
import { twMerge } from "tailwind-merge"
import { useMergedRefs } from "~/common/react/core.ts"
import { Button } from "~/components/Button.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { List } from "~/shared/list.ts"
import { textArea } from "~/styles/input.ts"
import { lightPanel } from "~/styles/panel.ts"
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

	const [messageText, setMessageText] = useState("")
	const [messageDice, setMessageDice] = useState(List.of<DiceOption[]>())
	const createMessage = useMutation(api.messages.create)

	const handleSend = async () => {
		const content = List.of(
			messageText.trim()
				? { type: "text" as const, text: messageText }
				: undefined,
			messageDice.length > 0
				? {
						type: "dice" as const,
						dice: messageDice.map((die) => ({
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

		setMessageText("")
		setMessageDice(List.of())
	}

	return (
		<div className="flex h-full flex-col gap-2">
			<div
				className="flex min-h-0 flex-1 flex-col overflow-y-auto gap-2"
				ref={ref}
			>
				{messages
					?.toReversed()
					.map((message) => (
						<MessageCard key={message._id} message={message} />
					))}
			</div>
			<div className="flex flex-col gap-1">
				<textarea
					className={textArea()}
					rows={2}
					value={messageText}
					onChange={(event) => setMessageText(event.currentTarget.value)}
				/>
				<div className="grid auto-cols-fr grid-flow-col gap">
					<Button
						icon={<Lucide.RotateCcw />}
						size="small"
						onClick={() => setMessageDice(List.of())}
					>
						Clear dice
					</Button>
					<ToastActionForm action={handleSend} className="contents">
						<Button type="submit" icon={<Lucide.Send />} size="small">
							Send
						</Button>
					</ToastActionForm>
				</div>
				<div className="flex flex-wrap items-center justify-center gap">
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
								className="h-auto !px-1.5 !py-0.5"
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
	const namesById = new Map(
		characters?.map((it) => [it.public._id, it.identity?.name]),
	)
	return (
		<div className={lightPanel("flex flex-col p-2 gap-2")}>
			{message.content.map((entry, index) => (
				<Fragment key={index}>
					{entry.type === "text" ? (
						<p>
							{entry.text.replaceAll(/<@([a-z0-9]+?)>/gi, (_, id) => {
								console.log(id, namesById.get(id))
								return namesById.get(id) ?? "(unknown)"
							})}
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
			<p className="text-sm font-bold text-primary-400">
				{message.author.name} •{" "}
				<time dateTime={new Date(message._creationTime).toISOString()}>
					{formatDistanceToNow(message._creationTime, { addSuffix: true })}
				</time>
			</p>
		</div>
	)
}

function DieIcon({
	faces,
	color,
	value,
	label = `d${faces}`,
	className,
}: {
	faces: number
	color?: string
	value?: ReactNode
	label?: ReactNode
	className?: string
}) {
	return (
		<div className={twMerge("w-10 cursor-default", className)}>
			<div className="relative flex aspect-square w-full items-center justify-center transition hover:brightness-125">
				<div
					data-color={color}
					className="size-full *:size-full *:fill-primary-600 *:stroke-1 data-[color]:saturate-50 *:data-[color=green]:fill-green-900 *:data-[color=red]:fill-red-900 *:data-[color=green]:stroke-green-200 *:data-[color=red]:stroke-red-200"
				>
					{faces === 4 ? (
						<Lucide.Pyramid />
					) : faces === 6 ? (
						<Lucide.Box />
					) : faces === 8 ? (
						<Lucide.Diamond />
					) : faces === 10 ? (
						<Lucide.Pentagon />
					) : faces === 12 ? (
						<Lucide.Hexagon />
					) : faces === 100 ? (
						<Lucide.Octagon />
					) : (
						<Lucide.Box />
					)}
				</div>
				<p
					data-color={color}
					className="absolute rounded-lg bg-primary-600 p-0.5 text-center font-bold leading-none empty:hidden data-[color=green]:bg-green-900 data-[color=red]:bg-red-900 data-[color]:saturate-50"
				>
					{value}
				</p>
			</div>
			<p className="text-center text-[10px] font-bold leading-3 tracking-wide">
				{label}
			</p>
		</div>
	)
}
