import { useQuery } from "convex/react"
import { createContext, useContext } from "react"
import type { Nullish } from "#app/common/types.js"
import { api } from "#convex/_generated/api.js"
import type { Doc } from "#convex/_generated/dataModel.js"
import { useRoom } from "../rooms/roomContext.tsx"

const SceneContext = createContext<Nullish<Doc<"scenes">>>(undefined)

export function SceneProvider({ children }: { children: React.ReactNode }) {
	const room = useRoom()
	const scene = useQuery(api.scenes.getCurrent, { roomId: room._id })
	return <SceneContext.Provider value={scene}>{children}</SceneContext.Provider>
}

export function useScene() {
	return useContext(SceneContext)
}
