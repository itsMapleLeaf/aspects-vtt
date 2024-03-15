import { createContext, useContext } from "react"
import type { Doc } from "#convex/_generated/dataModel.js"

const RoomContext = createContext<Doc<"rooms"> | undefined>(undefined)

export function useRoom() {
	const room = useContext(RoomContext)
	if (!room) {
		throw new Error("useRoom must be used within a RoomProvider")
	}
	return room
}

export function RoomProvider({
	children,
	room,
}: { children: React.ReactNode; room: Doc<"rooms"> }) {
	return <RoomContext.Provider value={room}>{children}</RoomContext.Provider>
}
