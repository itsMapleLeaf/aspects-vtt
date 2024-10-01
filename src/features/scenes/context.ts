import React, { use } from "react"
import { ApiScene } from "./types.ts"

export const ActiveSceneContext = React.createContext<
	ApiScene | null | undefined
>(undefined)

export function useActiveSceneContext() {
	return use(ActiveSceneContext)
}
