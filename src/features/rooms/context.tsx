import { createContext, use } from "react"
import { raise } from "~/shared/errors.ts"
import type { ApiRoom } from "./types.ts"

export const RoomContext = createContext<ApiRoom | undefined>(undefined)

export function useRoomContext() {
	return use(RoomContext) || raise("Room context provider not found")
}
