import { createContext, use, useState, type ReactNode } from "react"
import type { ApiToken } from "../../../convex/scenes/tokens/functions.ts"
import { clamp } from "../../helpers/math.ts"
import { Vector, type VectorInput, type VectorInputArgs } from "../../helpers/Vector.ts"
import { useDragSelectStore } from "../../ui/DragSelect.tsx"
import { useCurrentScene, useCurrentSceneTokens } from "./hooks.ts"

function useSceneState() {
	const [viewport, setViewport] = useState({ offset: Vector.zero, scaleTick: 0 })
	const [tokenDragOffset, setTokenDragOffset] = useState(Vector.zero)
	const tokenSelectStore = useDragSelectStore<ApiToken["key"]>()
	return { viewport, setViewport, tokenDragOffset, setTokenDragOffset, tokenSelectStore }
}

type SceneContext = ReturnType<typeof useSceneState>
const SceneContext = createContext<SceneContext | undefined>(undefined)

export function SceneProvider({ children }: { children: ReactNode }) {
	return <SceneContext.Provider value={useSceneState()}>{children}</SceneContext.Provider>
}

export function useSceneContext() {
	const context = use(SceneContext)
	if (context === undefined) {
		throw new Error("SceneContext not found")
	}

	const scene = useCurrentScene()
	const tokens = useCurrentSceneTokens()

	const { viewport, setViewport, tokenDragOffset, setTokenDragOffset, tokenSelectStore } = context
	const viewportScale = scaleAt(viewport.scaleTick)

	const selectedTokens = tokens.filter((it) => tokenSelectStore.isSelected(it.key))
	const isDraggingTokens = !tokenDragOffset.equals(Vector.zero)

	function scaleAt(tick: number) {
		return 1.3 ** tick
	}

	function mapPositionFromViewportPosition(...position: VectorInputArgs) {
		return Vector.from(...position)
			.minus(viewport.offset)
			.dividedBy(viewportScale)
	}

	return {
		scene: {
			cellSize: scene?.cellSize ?? 70,
		},

		mapPositionFromViewportPosition,

		tokenSelectStore,
		tokenDragOffset,
		setTokenDragOffset,
		tokens,
		selectedTokens,
		isDraggingTokens,

		viewport: {
			offset: viewport.offset,
			scale: viewportScale,

			move(delta: VectorInput) {
				setViewport((current) => ({
					...current,
					offset: current.offset.plus(delta),
				}))
			},

			zoom(delta: number, pivotInput: VectorInput) {
				setViewport((current) => {
					const newScaleTick = clamp(current.scaleTick + Math.sign(delta), -10, 10)
					if (newScaleTick === current.scaleTick) {
						return current
					}

					const pivot = Vector.from(pivotInput).minus(current.offset)
					const shift = pivot.minus(pivot.times(scaleAt(newScaleTick) / scaleAt(current.scaleTick)))
					return {
						...current,
						scaleTick: newScaleTick,
						offset: current.offset.plus(shift),
					}
				})
			},
		},
	}
}
