import { useUser } from "../auth/UserContext.tsx"
import { useCharacters } from "../rooms/roomContext.tsx"
import { OwnedCharacter } from "./types.ts"

export function useOwnedCharacter() {
	const user = useUser()
	const ownedCharacter = useCharacters()
		.filter((character) => character.playerId === user?.clerkId)
		.find(OwnedCharacter.is)
	return ownedCharacter
}
