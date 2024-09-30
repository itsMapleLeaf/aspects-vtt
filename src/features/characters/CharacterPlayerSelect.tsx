import { useMutation, useQuery } from "convex/react"
import { startTransition } from "react"
import { Select } from "~/components/Select.tsx"
import { useToastAction } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { useRoomContext } from "../rooms/context.tsx"

export function CharacterPlayerSelect({
	character,
}: {
	character: NormalizedCharacter
}) {
	const room = useRoomContext()
	const players = useQuery(api.rooms.getPlayers, { roomId: room._id })
	const update = useMutation(api.characters.update)

	const [_, updatePlayer, pending] = useToastAction(
		async (_, playerId: Id<"users"> | "") => {
			await update({
				characterId: character._id,
				playerId: playerId === "" ? null : playerId,
			})
		},
	)

	if (!room.isOwner) {
		return null
	}

	return (
		<Select
			label="Player"
			value={character.playerId ?? ""}
			options={[
				{
					name: "None",
					value: "",
				},
				...(players ?? []).map((it) => ({
					name: it.name,
					value: it._id,
				})),
			]}
			onChangeValue={(id) => {
				startTransition(() => {
					updatePlayer(id)
				})
			}}
			className={pending ? "pointer-events-none opacity-50" : ""}
		/>
	)
}
