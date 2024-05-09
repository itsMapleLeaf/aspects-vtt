import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { createContext } from "react"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { empty, useNonEmptyContext } from "../../common/context.tsx"
import type { ApiCharacter } from "../characters/types.ts"

export type ApiRoom = NonNullable<FunctionReturnType<typeof api.rooms.functions.get>>

const RoomContext = createContext<ApiRoom | typeof empty>(empty)
const CharacterContext = createContext<ApiCharacter[] | typeof empty>(empty)

export function RoomProvider({
	room,
	children,
}: {
	room: ApiRoom
	children: React.ReactNode
}) {
	const characters = useQuery(api.characters.functions.list, { roomId: room.slug })
	return (
		<RoomContext.Provider value={room}>
			<CharacterContext.Provider value={characters ?? []}>{children}</CharacterContext.Provider>
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
