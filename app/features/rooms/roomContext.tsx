import type { FunctionReturnType } from "convex/server"
import { createContext } from "react"
import { empty, useNonEmptyContext } from "#app/common/context.js"
import type { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import type { ApiCharacter } from "../characters/types.ts"

export type ApiRoom = NonNullable<FunctionReturnType<typeof api.rooms.get>["value"]>
const RoomContext = createContext<ApiRoom | typeof empty>(empty)

const CharacterContext = createContext<ApiCharacter[] | typeof empty>(empty)

export function RoomProvider(props: {
	children: React.ReactNode
	room: ApiRoom
	characters: ApiCharacter[]
}) {
	return (
		<RoomContext.Provider value={props.room}>
			<CharacterContext.Provider value={props.characters}>
				{props.children}
			</CharacterContext.Provider>
		</RoomContext.Provider>
	)
}

export function RoomOwnerOnly({ children }: { children: React.ReactNode }) {
	const room = useRoom()
	return room.isOwner && children
}

export function useRoom() {
	return useNonEmptyContext(RoomContext)
}

export function useCharacters() {
	return useNonEmptyContext(CharacterContext)
}

export function useCharacter(id: Id<"characters">) {
	const characters = useCharacters()
	return characters.find((c) => c._id === id)
}
