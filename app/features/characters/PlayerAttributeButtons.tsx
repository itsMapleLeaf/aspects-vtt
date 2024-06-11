import { AttributeDiceRollButtonGrid } from "./AttributeDiceRollButtonGrid.tsx"
import { useOwnedCharacter } from "./useOwnedCharacter.tsx"

export function PlayerAttributeButtons() {
	const ownedCharacter = useOwnedCharacter()
	return ownedCharacter ? <AttributeDiceRollButtonGrid characters={[ownedCharacter]} /> : null
}
