import { useMutation, useQuery } from "convex/react"
import { useEffect, useState } from "react"
import { CharacterForm } from "#app/features/characters/CharacterForm.tsx"
import { CharacterSelect } from "#app/features/characters/CharacterSelect.tsx"
import { CreateCharacterButton } from "#app/features/characters/CreateCharacterButton.tsx"
import { DeleteCharacterButton } from "#app/features/characters/DeleteCharacterButton.tsx"
import { DiceRollForm } from "#app/features/dice/DiceRollForm.tsx"
import { DiceRollList } from "#app/features/dice/DiceRollList.tsx"
import { RoomOwnerOnly, useRoom } from "#app/features/rooms/roomContext.js"
import { TokenMap } from "#app/features/tokens/TokenMap.js"
import { Loading } from "#app/ui/Loading.tsx"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"

export default function RoomIndexRoute() {
	const room = useRoom()
	const join = useMutation(api.rooms.join)
	const characters = useQuery(api.characters.list, { roomId: room._id })
	const playerCharacter = useQuery(api.characters.getPlayerCharacter, { roomId: room._id })

	const defaultCharacterId = room.isOwner ? characters?.data?.[0]?._id : playerCharacter?.data?._id
	const [currentCharacterId = defaultCharacterId, setCurrentCharacterId] =
		useState<Id<"characters">>()

	const character =
		characters?.data?.find((character) => character._id === currentCharacterId) ??
		characters?.data?.[0]

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
					<TokenMap
						selectedCharacterId={currentCharacterId}
						onSelectedCharacterChange={setCurrentCharacterId}
					/>
				</div>
				{characters === undefined ?
					<div className="flex max-w-[360px] flex-1 flex-col items-center justify-center">
						<Loading />
					</div>
				: !characters.ok ?
					<p>Failed to load characters: {characters.error}</p>
				:	<div className="flex max-w-[360px] flex-1 flex-col gap-2">
						<div className="flex gap-2">
							<div className="flex-1">
								<CharacterSelect
									characters={characters.data}
									selected={currentCharacterId}
									onChange={setCurrentCharacterId}
								/>
							</div>
							<RoomOwnerOnly>
								{character && <DeleteCharacterButton character={character} />}
								<CreateCharacterButton onCreate={setCurrentCharacterId} />
							</RoomOwnerOnly>
						</div>
						<div className="min-h-0 flex-1">
							{character ?
								<CharacterForm character={character} />
							:	undefined}
						</div>
					</div>
				}
			</main>
		</div>
	)
}
