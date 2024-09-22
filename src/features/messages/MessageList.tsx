import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNow } from "date-fns"
import * as Lucide from "lucide-react"
import { useEffect, useRef } from "react"
import { Fragment } from "react/jsx-runtime"
import { useMergedRefs } from "~/common/react/core.ts"
import { api } from "~/convex/_generated/api.js"
import { useRoomContext } from "../rooms/context.tsx"

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

	return (
		<div
			className="flex h-full flex-col overflow-y-auto border-t border-primary-700 *:border-t *:border-t-primary-700"
			ref={ref}
		>
			{messages
				?.toReversed()
				.map((message) => <MessageCard key={message._id} message={message} />)}
		</div>
	)
}

function MessageCard({
	message,
}: {
	message: FunctionReturnType<typeof api.messages.list>[number]
}) {
	return (
		<div className="flex flex-col p-2 gap-2">
			{message.blocks.map((block, index) => (
				<Fragment key={index}>
					{block.type === "text" ?
						<p>{block.text}</p>
					:	<aside className="flex flex-wrap items-center gap-1">
							<ul className="contents">
								{block.rolledDice.map((die, index) => (
									<li key={index}>
										<DieIcon {...die} />
									</li>
								))}
							</ul>
							<Lucide.Equal aria-hidden />
							<p className="text-xl font-medium">
								{block.rolledDice.reduce(
									(total, die) =>
										total +
										(die.operation === "subtract" ? -die.result : die.result),
									0,
								)}
							</p>
						</aside>
					}
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
	result,
}: {
	faces?: number
	color?: string
	result?: number
}) {
	return (
		<div className="cursor-default">
			<div className="relative flex items-center justify-center transition hover:brightness-125">
				<div
					data-color={color}
					className="*:size-10 *:fill-primary-600 *:stroke-1 data-[color]:saturate-50 *:data-[color=green]:fill-green-900 *:data-[color=red]:fill-red-900 *:data-[color=green]:stroke-green-200 *:data-[color=red]:stroke-red-200"
				>
					{faces === 4 ?
						<Lucide.Pyramid />
					: faces === 6 ?
						<Lucide.Box />
					: faces === 8 ?
						<Lucide.Diamond />
					: faces === 10 ?
						<Lucide.Pentagon />
					: faces === 12 ?
						<Lucide.Hexagon />
					: faces === 100 ?
						<Lucide.Octagon />
					:	<Lucide.Box />}
				</div>
				<p
					data-color={color}
					className="absolute rounded-lg bg-primary-600 p-0.5 text-center font-bold leading-none empty:hidden data-[color=green]:bg-green-900 data-[color=red]:bg-red-900 data-[color]:saturate-50"
				>
					{result}
				</p>
			</div>
			<p className="text-center text-[10px] font-bold leading-3 tracking-wide">
				d{faces}
			</p>
		</div>
	)
}
