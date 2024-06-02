import { useQuery } from "convex/react"
import { createContext, use, useState, type ReactNode } from "react"
import { api } from "../../../convex/_generated/api"
import type { ApiToken } from "../../../convex/scenes/tokens/functions.ts"
import { clamp } from "../../common/math.ts"
import { Vector, type VectorInput, type VectorInputArgs } from "../../common/vector.ts"
import { useDragSelectStore } from "../../ui/DragSelect.tsx"
import type { ApiScene } from "./types.ts"

function useSceneProvider(scene: ApiScene) {
	const [viewport, setViewport] = useState({
		offset: Vector.zero,
		scaleTick: 0,
	})
	const viewportScale = scaleAt(viewport.scaleTick)

	function scaleAt(tick: number) {
		return 1.3 ** tick
	}

	const tokenSelectStore = useDragSelectStore<ApiToken["key"]>()
	const [tokenDragOffset, setTokenDragOffset] = useState(Vector.zero)

	const tokens =
		useQuery(api.scenes.tokens.functions.list, {
			sceneId: scene._id,
		}) ?? []

	const selectedTokens = tokens.filter((it) => tokenSelectStore.isSelected(it.key))

	function mapPositionFromViewportPosition(...position: VectorInputArgs) {
		return (
			Vector.from(...position)
				.minus(viewport.offset)
				// .minus((scene.cellSize / 2) * viewportScale)
				.dividedBy(viewportScale)
		)
	}

	return {
		scene,
		mapPositionFromViewportPosition,

		tokenSelectStore,
		tokenDragOffset,
		setTokenDragOffset,
		tokens,
		selectedTokens,

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

type SceneContext = ReturnType<typeof useSceneProvider>
const SceneContext = createContext<SceneContext | undefined>(undefined)

export function SceneProvider({ scene, children }: { scene: ApiScene; children: ReactNode }) {
	return <SceneContext.Provider value={useSceneProvider(scene)}>{children}</SceneContext.Provider>
}

export function useSceneContext() {
	const context = use(SceneContext)
	if (context === undefined) {
		throw new Error("SceneContext not found")
	}
	return context
}
