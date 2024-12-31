import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { type ButtonProps } from "~/components/Button.tsx"
import { FormButton } from "~/components/FormButton.tsx"
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
				<FormButton
					action={addMembers}
					icon={<Lucide.Swords className="size-5" />}
					{...props}
				>
					Add to combat
				</FormButton>
			)}
			{inCombat.length > 0 && (
				<FormButton
					action={removeMembers}
					icon={<Lucide.UserMinus className="size-5" />}
					{...props}
				>
					Remove from combat
				</FormButton>
			)}
		</>
	)
}
