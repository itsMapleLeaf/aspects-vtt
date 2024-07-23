import type { Nullish } from "~/helpers/types.ts"
import { useUser } from "../auth/hooks.ts"
import { useCharacters, useRoom } from "../rooms/roomContext.tsx"
import type { ApiCharacter } from "./types.ts"

export function useCharacterUpdatePermission(
	character: Nullish<ApiCharacter>,
): character is Required<ApiCharacter> {
	const room = useRoom()
	const user = useUser()
	if (room.isOwner) return true
	if (!character) return false
	if (!user) return false
	return character.player === user._id
}

export function useOwnedCharacters() {
	const user = useUser()
	const characters = useCharacters()
	return user ?
			(characters.filter((character) => character.player === user?._id) as Array<
				Required<ApiCharacter>
			>)
		:	[]
}

/** @deprecated Use {@link useOwnedCharacters} */
export function useOwnedCharacter() {
	return useOwnedCharacters()[0]
}
