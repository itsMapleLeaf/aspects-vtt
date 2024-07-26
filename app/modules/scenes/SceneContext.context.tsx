import { createContext } from "react"
import type { Vector, VectorInput, VectorInputArgs } from "~/helpers/Vector.ts"
import type { useDragSelectStore } from "~/ui/DragSelect.tsx"
import type { ApiToken } from "../../../convex/scenes/tokens/functions.ts"

interface SceneContextType {
	scene: {
		cellSize: number
	}
	viewport: {
		offset: Vector
		scale: number
		move: (delta: VectorInput) => void
		zoom: (delta: number, pivotInput: VectorInput) => void
	}
	tokenSelectStore: ReturnType<typeof useDragSelectStore<ApiToken["key"]>>
	tokenDragOffset: Vector
	setTokenDragOffset: (value: Vector) => void
	tokens: ApiToken[]
	selectedTokens: ApiToken[]
	isDraggingTokens: boolean
	mapPositionFromViewportPosition: (...position: VectorInputArgs) => Vector
}

// this is in a separate file because vite is weird
export const SceneContext = createContext<SceneContextType | undefined>(undefined)
