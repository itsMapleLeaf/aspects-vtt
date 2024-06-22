import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api.js"
import { useQuerySuspense } from "../convex/suspense.ts"
import { useRoom } from "../rooms/roomContext.tsx"

export function useCurrentScene() {
	const room = useRoom()
	return useQuerySuspense(
		api.scenes.functions.get,
		room.currentScene ? { id: room.currentScene } : "skip",
	)
}

export function useCurrentSceneTokens() {
	const { currentScene: sceneId } = useRoom()
	return useQuery(api.scenes.tokens.functions.list, sceneId ? { sceneId } : "skip") ?? []
}
