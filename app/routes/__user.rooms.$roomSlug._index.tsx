import { useMutation, useQuery } from "convex/react"
import { useEffect, useState } from "react"
import { CharacterForm } from "#app/features/characters/CharacterForm.tsx"
import { CharacterSelect } from "#app/features/characters/CharacterSelect.tsx"
import { CreateCharacterButton } from "#app/features/characters/CreateCharacterButton.tsx"
import { DeleteCharacterButton } from "#app/features/characters/DeleteCharacterButton.tsx"
import { DiceRollForm } from "#app/features/dice/DiceRollForm.tsx"
import { DiceRollList } from "#app/features/dice/DiceRollList.tsx"
import { useRoom } from "#app/features/rooms/roomContext.js"
import { TokenMap } from "#app/features/tokens/TokenMap.js"
import { Loading } from "#app/ui/Loading.tsx"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"

export default function RoomIndexRoute() {
	const room = useRoom()
	const join = useMutation(api.rooms.join)
	const characters = useQuery(api.characters.list, { roomId: room._id })
	const playerCharacter = useQuery(api.characters.getPlayerCharacter, { roomId: room._id })

	const [currentCharacterId = characters?.[0]?._id, setCurrentCharacterId] =
		useState<Id<"characters">>()

	const character =
		characters?.find((character) => character._id === currentCharacterId) ?? characters?.[0]

	useEffect(() => {
		join({ id: room._id })
	}, [room._id, join])

	return (
		<div className="flex h-full flex-col gap-2 bg-primary-100">
			<main className="flex min-h-0 flex-1 gap-2">
				<div className="flex h-full max-w-[360px] flex-1 flex-col gap-2">
					<DiceRollForm />
					<div className="min-h-0 flex-1">
						<DiceRollList />
					</div>
				</div>
				<div className="flex min-w-0 flex-1">
					{room.isOwner ? (
						<TokenMap
							selectedCharacterId={currentCharacterId}
							onSelectedCharacterChange={setCurrentCharacterId}
						/>
					) : (
						<TokenMap selectedCharacterId={playerCharacter?._id} />
					)}
				</div>
				{characters === undefined ? (
					<div className="flex max-w-[360px] flex-1 flex-col items-center justify-center">
						<Loading />
					</div>
				) : (
					<div className="flex max-w-[360px] flex-1 flex-col gap-2">
						{room.isOwner && (
							<div className="flex gap-2">
								<div className="flex-1">
									<CharacterSelect
										characters={characters}
										selected={currentCharacterId}
										onChange={setCurrentCharacterId}
									/>
								</div>
								{character && currentCharacterId && <DeleteCharacterButton character={character} />}
								<CreateCharacterButton onCreate={setCurrentCharacterId} />
							</div>
						)}
						{room.isOwner && character && (
							<div className="min-h-0 flex-1">
								<CharacterForm character={character} />
							</div>
						)}
						{!room.isOwner && playerCharacter && (
							<div className="min-h-0 flex-1">
								<CharacterForm character={playerCharacter} />
							</div>
						)}
					</div>
				)}
			</main>
		</div>
	)
}
