import {
	draggable,
	dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useMutation, useQuery } from "convex/react"
import { FunctionReturnType } from "convex/server"
import {
	LucideFastForward,
	LucideRewind,
	LucideSquare,
	LucideSwords,
} from "lucide-react"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import * as v from "valibot"
import { Avatar } from "~/components/Avatar.tsx"
import { Button } from "~/components/Button.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { lightPanel } from "~/styles/panel.ts"
import { secondaryHeading, subText } from "~/styles/text.ts"
import { Id } from "../../../convex/_generated/dataModel"
import { getImageUrl } from "../images/getImageUrl.ts"
import { useRoomContext } from "../rooms/context.tsx"

export function CombatTracker() {
	const room = useRoomContext()
	const roomId = room._id
	const combat = useQuery(api.rooms.getCombat, { roomId })
	const [animateRef] = useAutoAnimate()

	const update = useMutation(api.rooms.updateCombat).withOptimisticUpdate(
		(store, { roomId, action }) => {
			const combat = store.getQuery(api.rooms.getCombat, { roomId })
			if (!combat) return

			if (action.type === "moveMember") {
				const memberIndex = combat.members.findIndex(
					(it) => it.id === action.memberId,
				)
				if (memberIndex === -1) return
				const members = [...combat.members]
				members.splice(action.toIndex, 0, ...members.splice(memberIndex, 1))
				store.setQuery(api.rooms.getCombat, { roomId }, { ...combat, members })
			}
		},
	)

	return (
		<div className="flex h-full flex-col gap-2">
			{combat === undefined ? null : combat === null ? (
				room.isOwner ? (
					<ToastActionForm
						action={() => update({ roomId, action: { type: "start" } })}
						className="flex flex-col items-center"
					>
						<Button type="submit" icon={<LucideSwords />} size="large">
							Start combat
						</Button>
					</ToastActionForm>
				) : (
					<p
						className={secondaryHeading(
							"text-balance px-4 py-8 text-center opacity-50",
						)}
					>
						Combat is currently inactive.
					</p>
				)
			) : (
				<>
					<ul
						className="flex min-h-0 flex-1 flex-col overflow-y-auto gap-1"
						ref={animateRef}
					>
						{combat.members.map((member, index) => (
							<li key={member.id}>
								<CombatMemberCard
									member={member}
									onDrop={(droppedMemberId) => {
										update({
											roomId,
											action: {
												type: "moveMember",
												memberId: droppedMemberId,
												toIndex: index,
											},
										})
									}}
								/>
							</li>
						))}
					</ul>

					{room.isOwner && (
						<div className="flex justify-center gap">
							<ToastActionForm
								action={() => update({ roomId, action: { type: "rewind" } })}
							>
								<Button
									appearance="clear"
									type="submit"
									icon={<LucideRewind />}
								>
									<span className="sr-only">Rewind</span>
								</Button>
							</ToastActionForm>
							<ToastActionForm
								action={() => update({ roomId, action: { type: "stop" } })}
							>
								<Button
									appearance="clear"
									type="submit"
									icon={<LucideSquare />}
								>
									<span className="sr-only">End combat</span>
								</Button>
							</ToastActionForm>
							<ToastActionForm
								action={() => update({ roomId, action: { type: "advance" } })}
							>
								<Button
									appearance="clear"
									type="submit"
									icon={<LucideFastForward />}
								>
									<span className="sr-only">Advance</span>
								</Button>
							</ToastActionForm>
						</div>
					)}
				</>
			)}
		</div>
	)
}

function CombatMemberCard({
	member,
	onDrop,
}: {
	member: NonNullable<
		FunctionReturnType<typeof api.rooms.getCombat>
	>["members"][number]
	onDrop: (memberId: Id<"characters">) => void
}) {
	const update = useMutation(api.rooms.updateCombat)
	const room = useRoomContext()
	const [over, setOver] = useState(false)

	const content = (
		<div
			className={twMerge(
				"flex w-full items-center p-gap text-start transition gap-1.5",
				member.isCurrent ? lightPanel() : "opacity-75",
			)}
		>
			<Avatar
				src={member.imageId ? getImageUrl(member.imageId) : null}
				className="size-8"
			/>
			<div>
				<div className={secondaryHeading("leading-6")}>
					{member.character?.identity?.name ?? "???"}
				</div>
				{member.character?.full && (
					<div className={subText("leading-4")}>
						Mobility {member.character.full.attributes.mobility}
					</div>
				)}
			</div>
		</div>
	)

	if (!room.isOwner) {
		return content
	}

	const dataSchema = v.object({
		combatMemberId: v.custom<Id<"characters">>((v) => typeof v === "string"),
	})

	return (
		<ToastActionForm
			data-over={over}
			className="rounded-md border border-transparent transition-colors data-[over=true]:border-accent-700"
			action={() =>
				update({
					roomId: room._id,
					action: { type: "setCurrentMember", memberId: member.id },
				})
			}
			ref={(element) => {
				if (!element) return

				return dropTargetForElements({
					element,
					onDragEnter(args) {
						if (v.is(dataSchema, args.source.data)) {
							setOver(true)
						}
					},
					onDragLeave(args) {
						if (v.is(dataSchema, args.source.data)) {
							setOver(false)
						}
					},
					onDrop(args) {
						setOver(false)
						if (v.is(dataSchema, args.source.data)) {
							onDrop(args.source.data.combatMemberId)
						}
					},
				})
			}}
		>
			<button
				type="submit"
				className="w-full rounded-md transition-colors hover:bg-primary-700"
				ref={(element) => {
					if (!element) return

					return draggable({
						element,
						getInitialData(): v.InferInput<typeof dataSchema> {
							return {
								combatMemberId: member.id,
							}
						},
					})
				}}
			>
				{content}
			</button>
		</ToastActionForm>
	)
}
