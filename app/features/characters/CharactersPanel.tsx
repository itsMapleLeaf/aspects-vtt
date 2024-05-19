import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { useListener } from "../../common/emitter.ts"
import { Button } from "../../ui/Button.tsx"
import { Loading } from "../../ui/Loading.tsx"
import { RoomOwnerOnly, useRoom } from "../rooms/roomContext.tsx"
import { CharacterForm } from "./CharacterForm.tsx"
import { CharacterSelect } from "./CharacterSelect.tsx"
import { CreateCharacterButton } from "./CreateCharacterButton.tsx"
import { DeleteCharacterButton } from "./DeleteCharacterButton.tsx"
import { editCharacterEvent } from "./events"

export function CharactersPanel() {
	const room = useRoom()
	const characters = useQuery(api.characters.functions.list, {
		roomId: room._id,
	})
	const playerCharacter = characters?.find((character) => character.isOwner)

	const [selectedCharacterId, setSelectedCharacterId] =
		useState<Id<"characters">>()
	const defaultCharacter = (!room.isOwner && playerCharacter) || characters?.[0]
	const character =
		characters?.find((character) => character._id === selectedCharacterId) ??
		defaultCharacter

	useListener(editCharacterEvent, setSelectedCharacterId)

	return (
		<div className="flex h-full flex-col gap-2 p-2">
			<div className="flex gap-2">
				<div className="flex-1">
					{characters === undefined ?
						<Loading />
					: character ?
						<CharacterSelect
							characters={characters}
							selected={character._id}
							onChange={setSelectedCharacterId}
						/>
					:	<p className="flex h-10 flex-row items-center px-2 opacity-60">
							No characters found.
						</p>
					}
				</div>
				<RoomOwnerOnly>
					{character && (
						<DuplicateCharacterButton
							character={character}
							onDuplicate={setSelectedCharacterId}
						/>
					)}
					{character && <DeleteCharacterButton character={character} />}
					<CreateCharacterButton onCreate={setSelectedCharacterId} />
				</RoomOwnerOnly>
			</div>
			<div className="min-h-0 flex-1">
				{character ?
					<CharacterForm character={character} />
				:	undefined}
			</div>
		</div>
	)
}

function DuplicateCharacterButton({
	character,
	onDuplicate,
}: {
	character: { _id: Id<"characters"> }
	onDuplicate: (newCharacterId: Id<"characters">) => void
}) {
	const duplicate = useMutation(api.characters.functions.duplicate)
	return (
		<Button
			icon={<Lucide.Copy />}
			title="Duplicate Character"
			onClick={async () => {
				onDuplicate(await duplicate({ id: character._id, randomize: false }))
			}}
		/>
	)
}
