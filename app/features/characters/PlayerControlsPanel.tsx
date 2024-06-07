import { useUser } from "../auth/UserContext.tsx"
import { useCharacters } from "../rooms/roomContext.tsx"
import { AttributeDiceRollButtonGrid } from "./AttributeDiceRollButtonGrid.tsx"
import { CharacterStatusFields } from "./CharacterStatusFields.tsx"
import { OwnedCharacter } from "./types.ts"

export function PlayerControlsPanel() {
	const user = useUser()
	const ownedCharacter = useCharacters()
		.filter((character) => character.playerId === user?.clerkId)
		.find(OwnedCharacter.is)
	return (
		<>
			{ownedCharacter && (
				<AttributeDiceRollButtonGrid characters={[ownedCharacter]} variant="horizontal" />
			)}
			{ownedCharacter && <CharacterStatusFields character={ownedCharacter} />}
		</>
	)
}
