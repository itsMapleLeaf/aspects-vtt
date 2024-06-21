import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { createContext } from "react"
import type { Nullish } from "~/helpers/types.ts"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { empty, useStrictContext } from "../../helpers/react/strictContext.tsx"
import type { ApiCharacter } from "../characters/types.ts"

export type ApiRoom = NonNullable<FunctionReturnType<typeof api.rooms.functions.get>>

const RoomContext = createContext<ApiRoom | typeof empty>(empty)
const CharacterContext = createContext<ApiCharacter[] | typeof empty>(empty)

export function RoomProvider({ room, children }: { room: ApiRoom; children: React.ReactNode }) {
	const characters = useQuery(api.characters.functions.list, {
		roomId: room._id,
	})
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
	return useStrictContext(RoomContext)
}

export function useCharacters() {
	return useStrictContext(CharacterContext)
}

export function useCharacter(id: Nullish<Id<"characters">>) {
	const characters = useCharacters()
	return characters.find((c) => c._id === id)
}
