import { AttributeDiceRollButtonGrid } from "../attributes/AttributeDiceRollButtonGrid.tsx"
import { useOwnedCharacter } from "../characters/hooks.ts"

export function PlayerAttributeButtons() {
	const ownedCharacter = useOwnedCharacter()
	return ownedCharacter ?
			<AttributeDiceRollButtonGrid characters={[ownedCharacter]} />
		:	null
}
