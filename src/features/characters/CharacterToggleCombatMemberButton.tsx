import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { Button, type ButtonProps } from "~/components/Button.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import type { StrictOmit } from "~/lib/types.ts"
import { NormalizedCharacter } from "../../../convex/characters.ts"
import { useRoomContext } from "../rooms/context.tsx"

export function CharacterToggleCombatMemberButton({
	characters,
	...props
}: {
	characters: NormalizedCharacter[]
} & StrictOmit<ButtonProps, "children">) {
	const room = useRoomContext()
	const updateCombat = useMutation(api.rooms.updateCombat)

	if (!room.isOwner || room.combat == null) {
		return null
	}

	const combatMemberIds = new Set(room.combat.memberIds)
	const characterIds = characters.map((it) => it._id)
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
