import { useSearchParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api.js"
import { useRoom } from "../rooms/roomContext.tsx"

export function useSelectedScene() {
	const sceneId = useSceneParam()
	return useQuery(api.scenes.functions.get, sceneId ? { id: sceneId } : "skip")
}

export function useSceneParam() {
	const room = useRoom()
	const [searchParams] = useSearchParams()

	// the param is for a viewed scene by the owner,
	// and players shouldn't be able to use that
	const sceneParam = room.isOwner ? searchParams.get("scene") : null
	return sceneParam ?? room.currentScene
}

export function useSelectedSceneTokens() {
	const scene = useSelectedScene()
	return (
		useQuery(
			api.scenes.tokens.functions.list,
			scene ? { sceneId: scene._id } : "skip",
		) ?? []
	)
}
