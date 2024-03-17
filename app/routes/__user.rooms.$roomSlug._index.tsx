import { useQuery } from "convex/react"
import { CharacterForm } from "#app/features/characters/CharacterForm.tsx"
import { CharacterSelect } from "#app/features/characters/CharacterSelect.tsx"
import { CreateCharacterButton } from "#app/features/characters/CreateCharacterButton.tsx"
import { DeleteCharacterButton } from "#app/features/characters/DeleteCharacterButton.tsx"
import { useCurrentCharacterId } from "#app/features/characters/useCurrentCharacterId.ts"
import { DiceRollForm } from "#app/features/dice/DiceRollForm.tsx"
import { DiceRollList } from "#app/features/dice/DiceRollList.tsx"
import { useRoom } from "#app/features/rooms/roomContext.js"
import { TokenMap } from "#app/features/tokens/TokenMap.js"
import { Loading } from "#app/ui/Loading.tsx"
import { api } from "#convex/_generated/api.js"

export default function RoomIndexRoute() {
	const user = useQuery(api.auth.user)
	const room = useRoom()
	return (
		<div className="flex h-full flex-col gap-2 bg-primary-100">
			<main className="flex min-h-0 flex-1 gap-2">
				<div className="flex h-full max-w-[360px] flex-1 flex-col gap-2">
					{user && <DiceRollForm userId={user._id} />}
					<div className="min-h-0 flex-1">
						<DiceRollList />
					</div>
				</div>
				<div className="flex min-w-0 flex-1">
					<TokenMap />
				</div>
				{room.isOwner ? <CharacterManager /> : null /* todo */}
			</main>
		</div>
	)
}

function CharacterManager() {
	const room = useRoom()
	const characters = useQuery(api.characters.list, { roomId: room._id })
	const [currentCharacterId] = useCurrentCharacterId()
	const firstCharacter = characters?.[0]
	const character = characters?.find((c) => c._id === currentCharacterId) ?? firstCharacter

	return characters === undefined ? (
		<div className="flex max-w-[360px] flex-1 flex-col items-center justify-center">
			<Loading />
		</div>
	) : (
		<div className="flex max-w-[360px] flex-1 flex-col gap-2">
			<div className="flex gap-2">
				<div className="flex-1">
					<CharacterSelect characters={characters} />
				</div>
				{character && <DeleteCharacterButton character={character} />}
				<CreateCharacterButton />
			</div>
			{character && (
				<div className="min-h-0 flex-1">
					<CharacterForm character={character} />
				</div>
			)}
		</div>
	)
}
