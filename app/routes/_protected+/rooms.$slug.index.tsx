import { useMutationState } from "#app/common/useMutationState.js"
import { CharacterForm } from "#app/features/characters/CharacterForm.tsx"
import { CharacterSelect } from "#app/features/characters/CharacterSelect.tsx"
import { CreateCharacterButton } from "#app/features/characters/CreateCharacterButton.tsx"
import { DeleteCharacterButton } from "#app/features/characters/DeleteCharacterButton.tsx"
import { DiceRollForm } from "#app/features/dice/DiceRollForm.tsx"
import { DiceRollList } from "#app/features/dice/DiceRollList.tsx"
import { RoomOwnerOnly, useRoom } from "#app/features/rooms/roomContext.js"
import { SetMapBackgroundButton } from "#app/features/tokens/SetMapBackgroundButton.js"
import { Token } from "#app/features/tokens/Token.tsx"
import {
	TokenMapViewport,
	type ViewportController,
} from "#app/features/tokens/TokenMapViewport.tsx"
import { AppHeader } from "#app/ui/AppHeader.js"
import { Button } from "#app/ui/Button.js"
import { FormField } from "#app/ui/FormField.js"
import { Input } from "#app/ui/Input.js"
import { Loading } from "#app/ui/Loading.tsx"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import { UserButton } from "@clerk/remix"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function RoomIndexRoute() {
	const room = useRoom()

	const join = useMutation(api.rooms.join)
	useEffect(() => {
		join({ id: room._id })
	}, [room._id, join])

	const characters = useQuery(api.characters.list, { roomId: room._id })
	const playerCharacter = useQuery(api.characters.getPlayerCharacter, { roomId: room._id })
	const tokens = useQuery(api.characters.listTokens, { roomId: room._id })

	const defaultCharacterId = room.isOwner ? characters?.data?.[0]?._id : playerCharacter?.data?._id
	const [currentCharacterId = defaultCharacterId, setCurrentCharacterId] =
		useState<Id<"characters">>()

	const character =
		characters?.data?.find((character) => character._id === currentCharacterId) ??
		characters?.data?.[0]

	const viewportRef = useRef<ViewportController>(null)

	return (
		<div className="isolate flex h-dvh flex-col gap-4 p-4">
			<div className="fixed inset-0 -z-10">
				<TokenMapViewport controllerRef={viewportRef}>
					{tokens?.data?.map((character) => (
						<Token
							key={character._id}
							character={character}
							selected={currentCharacterId === character._id}
							onSelect={() => {
								setCurrentCharacterId(character._id)
							}}
						/>
					))}
				</TokenMapViewport>
			</div>

			<div className="-mx-4 -mt-4 border-b border-primary-300 bg-primary-100/75 p-4 backdrop-blur">
				<AppHeader>
					<UserButton />
				</AppHeader>
			</div>

			<main className="pointer-events-none flex min-h-0 flex-1 justify-between gap-2 *:pointer-events-auto">
				<div
					className={panel(
						"flex max-w-[360px] flex-1 flex-col gap-2 rounded-md bg-primary-100/75 p-2 shadow-md shadow-black/50 backdrop-blur",
					)}
				>
					<DiceRollForm />
					<div className="min-h-0 flex-1">
						<DiceRollList />
					</div>
				</div>

				<div className={"flex flex-wrap items-end gap-[inherit] self-end"}>
					{room.isOwner && <CellSizeField />}
					{room.isOwner && <SetMapBackgroundButton />}
					<Button
						text="Reset View"
						icon={<Lucide.Compass />}
						onClick={() => viewportRef.current?.resetView()}
					/>
				</div>

				{characters === undefined ?
					<div className="flex max-w-[360px] flex-1 flex-col items-center justify-center">
						<Loading />
					</div>
				: !characters.ok ?
					<p>Failed to load characters: {characters.error}</p>
				:	<div
						className={panel(
							"flex max-w-[360px] flex-1 flex-col gap-2 rounded-md bg-primary-100/75 p-2 shadow-md shadow-black/50 backdrop-blur",
						)}
					>
						<div className="flex gap-2">
							<div className="flex-1">
								<CharacterSelect
									characters={characters.data}
									selected={currentCharacterId}
									onChange={setCurrentCharacterId}
								/>
							</div>
							<RoomOwnerOnly>
								{character && (
									<DuplicateCharacterButton
										character={character}
										onDuplicate={setCurrentCharacterId}
									/>
								)}
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

function DuplicateCharacterButton({
	character,
	onDuplicate,
}: {
	character: { _id: Id<"characters"> }
	onDuplicate: (newCharacterId: Id<"characters">) => void
}) {
	const duplicate = useMutation(api.characters.duplicate)
	return (
		<Button
			icon={<Lucide.Copy />}
			title="Duplicate Character"
			onClick={async () => {
				onDuplicate(await duplicate({ id: character._id }))
			}}
		/>
	)
}

function CellSizeField() {
	const room = useRoom()
	const [updateRoomState, updateRoom] = useMutationState(api.rooms.update)
	return (
		<FormField label="Cell Size" htmlFor="cellSize">
			<Input
				id="cellSize"
				type="number"
				className="w-20"
				value={updateRoomState.args?.mapCellSize ?? room.mapCellSize}
				onChange={(event) => {
					const value = event.currentTarget.valueAsNumber
					if (Number.isNaN(value)) return
					updateRoom({ id: room._id, mapCellSize: Math.max(value, 1) })
				}}
			/>
		</FormField>
	)
}
