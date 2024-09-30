import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import type { StrictOmit } from "~/common/types.ts"
import { Button, type ButtonProps } from "~/components/Button.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { useRoomContext } from "../rooms/context.tsx"

export function CharacterToggleCombatMemberButton({
	characterIds,
	...props
}: {
	characterIds: Id<"characters">[]
} & StrictOmit<ButtonProps, "children">) {
	const room = useRoomContext()
	const updateCombat = useMutation(api.rooms.updateCombat)

	if (!room.isOwner || room.combat == null) {
		return null
	}

	const combatMemberIds = new Set(room.combat.memberIds)

	const inCombat = characterIds.filter((id) => combatMemberIds.has(id))
	const outOfCombat = characterIds.filter((id) => !combatMemberIds.has(id))

	const addMembers = async () => {
		await updateCombat({
			roomId: room._id,
			action: { type: "addMembers" as const, memberIds: characterIds },
		})
	}

	const removeMembers = async () => {
		await updateCombat({
			roomId: room._id,
			action: { type: "removeMembers" as const, memberIds: characterIds },
		})
	}

	return (
		<>
			{outOfCombat.length > 0 && (
				<ToastActionForm action={addMembers} className="contents">
					<Button
						icon={<Lucide.Swords className="size-5" />}
						{...props}
						type="submit"
					>
						Add to combat
					</Button>
				</ToastActionForm>
			)}
			{inCombat.length > 0 && (
				<ToastActionForm action={removeMembers} className="contents">
					<Button
						icon={<Lucide.UserMinus className="size-5" />}
						{...props}
						type="submit"
					>
						Remove from combat
					</Button>
				</ToastActionForm>
			)}
		</>
	)
}
