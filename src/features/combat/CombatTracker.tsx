import { useMutation, useQuery } from "convex/react"
import {
	LucideFastForward,
	LucideRewind,
	LucideSquare,
	LucideSwords,
} from "lucide-react"
import { twMerge } from "tailwind-merge"
import { Avatar } from "~/components/Avatar.tsx"
import { Button } from "~/components/Button.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { lightPanel } from "~/styles/panel.ts"
import { secondaryHeading, subText } from "~/styles/text.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { useRoomContext } from "../rooms/context.tsx"

export function CombatTracker() {
	const room = useRoomContext()
	const roomId = room._id
	const combat = useQuery(api.rooms.getCombat, { roomId })
	const update = useMutation(api.rooms.updateCombat)

	return (
		<div className="flex h-full flex-col gap-2">
			{combat === undefined ? null : combat === null ? (
				<ToastActionForm
					action={() => update({ roomId, action: { type: "start" } })}
					className="flex flex-col items-center"
				>
					<Button type="submit" icon={<LucideSwords />} size="large">
						Start combat
					</Button>
				</ToastActionForm>
			) : (
				<>
					<ul className="min-h-0 flex-1 overflow-y-auto">
						{combat.members.map((member, index) => (
							<li key={member.id ?? index} className="contents">
								<ToastActionForm
									action={() =>
										update({
											roomId,
											action: { type: "setCurrentMember", memberId: member.id },
										})
									}
								>
									<button
										type={room.isOwner ? "submit" : "button"}
										className={twMerge(
											lightPanel(),
											"flex w-full items-center p-gap text-start transition gap-1.5",
											member.isCurrent
												? ""
												: "border-transparent bg-transparent opacity-75",
										)}
									>
										<Avatar
											src={
												member.character?.public.imageId
													? getImageUrl(member.character?.public.imageId)
													: null
											}
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
									</button>
								</ToastActionForm>
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
