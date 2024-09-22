import { createContext, use } from "react"
import type { Doc } from "~/convex/_generated/dataModel.js"
import { raise } from "~/shared/errors.ts"

export const RoomContext = createContext<Doc<"rooms"> | undefined>(undefined)

export function useRoomContext() {
	return use(RoomContext) || raise("Room context provider not found")
}
