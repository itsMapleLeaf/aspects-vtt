import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { Button, type ButtonProps } from "~/components/Button.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { useRoomContext } from "../rooms/context.tsx"

export function CharacterToggleCombatMemberButton({
	characterId,
	...props
}: {
	characterId: Id<"characters">
} & ButtonProps) {
	const room = useRoomContext()
	const updateCombat = useMutation(api.rooms.updateCombat)

	if (room.combat === null) {
		return null
	}

	const isInCombat = room.combat?.memberIds.includes(characterId)

	const handleToggleCombat = async () => {
		const action = isInCombat
			? { type: "removeMembers" as const, memberIds: [characterId] }
			: { type: "addMembers" as const, memberIds: [characterId] }

		await updateCombat({ roomId: room._id, action })
	}

	return (
		<ToastActionForm action={handleToggleCombat} className="contents">
			<Button
				icon={
					isInCombat ? (
						<Lucide.UserMinus className="size-5" />
					) : (
						<Lucide.Swords className="size-5" />
					)
				}
				{...props}
				type="submit"
			>
				{props.children ||
					(isInCombat ? "Remove from combat" : "Add to combat")}
			</Button>
		</ToastActionForm>
	)
}
