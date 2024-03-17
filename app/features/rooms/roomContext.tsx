import type { FunctionReturnType } from "convex/server"
import { createContext, useContext } from "react"
import type { api } from "#convex/_generated/api.js"

type Room = NonNullable<FunctionReturnType<typeof api.rooms.get>>

const RoomContext = createContext<Room | undefined>(undefined)

export function useRoom() {
	const room = useContext(RoomContext)
	if (!room) {
		throw new Error("useRoom must be used within a RoomProvider")
	}
	return room
}

export function RoomProvider({ children, room }: { children: React.ReactNode; room: Room }) {
	return <RoomContext.Provider value={room}>{children}</RoomContext.Provider>
}

export function RoomOwnerOnly({ children }: { children: React.ReactNode }) {
	const room = useRoom()
	return room.isOwner && children
}
