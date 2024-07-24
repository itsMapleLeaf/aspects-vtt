import type { Nullish } from "~/helpers/types.ts"
import { useCharacters } from "../rooms/roomContext.tsx"
import { hasFullCharacterPermissions } from "./helpers.ts"
import type { ApiCharacter, OwnedApiCharacter } from "./types.ts"

export function useCharacterUpdatePermission(
	character: Nullish<ApiCharacter>,
): character is OwnedApiCharacter {
	return character != null && hasFullCharacterPermissions(character)
}

export function useOwnedCharacters() {
	const characters = useCharacters()
	return characters.filter(hasFullCharacterPermissions) as OwnedApiCharacter[]
}

/** @deprecated Use {@link useOwnedCharacters} */
export function useOwnedCharacter() {
	return useOwnedCharacters()[0]
}
