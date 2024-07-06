import { useMutation } from "convex/react"
import { useFilter } from "~/helpers/react/hooks.ts"
import type { Nullish } from "~/helpers/types.ts"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { useUser } from "../auth/hooks.ts"
import { useSafeAction } from "../convex/hooks.ts"
import { useCharacter, useCharacters, useRoom } from "../rooms/roomContext.tsx"
import type { ApiCharacter } from "./types.ts"

export function useCreateCharacterMutation({
	onCreate,
}: {
	onCreate?: (id: Id<"characters">) => void
} = {}) {
	const room = useRoom()
	const createCharacter = useMutation(api.characters.functions.create)
	const [state, action] = useSafeAction(async () => {
		const id = await createCharacter({ roomId: room._id })
		onCreate?.(id)
		return id
	})
	const character = useFilter(useCharacter(state.value), (it) => it != null)
	return { action, character }
}

export function useCharacterUpdatePermission(
	character: Nullish<ApiCharacter>,
): character is Required<ApiCharacter> {
	const room = useRoom()
	const user = useUser()
	if (room.isOwner) return true
	if (!character) return false
	if (!user) return false
	return character.playerId === user.clerkId
}

export function useOwnedCharacters() {
	const user = useUser()
	const characters = useCharacters()
	return user ?
			(characters.filter((character) => character.playerId === user?.clerkId) as Array<
				Required<ApiCharacter>
			>)
		:	[]
}

/** @deprecated Use {@link useOwnedCharacters} */
export function useOwnedCharacter() {
	return useOwnedCharacters()[0]
}
