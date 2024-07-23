import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api.js"
import { useQuerySuspense } from "../convex/suspense.ts"
import { useRoom } from "../rooms/roomContext.tsx"

export function useCurrentRoomScene() {
	const room = useRoom()
	return useQuerySuspense(api.scenes.functions.getCurrent, { roomId: room._id })
}

export function useCurrentSceneTokens() {
	const { currentScene: sceneId } = useRoom()
	return useQuery(api.scenes.tokens.functions.list, sceneId ? { sceneId } : "skip") ?? []
}
