import { type ReactNode, use, useState } from "react"
import {
	Vector,
	type VectorInput,
	type VectorInputArgs,
} from "../../../common/Vector.ts"
import { clamp } from "../../../common/math.ts"
import type { ApiToken } from "../../../convex/scenes/tokens/functions.ts"
import { useDragSelectStore } from "../../ui/DragSelect.tsx"
import { SceneContext } from "./SceneContext.context.tsx"
import { useSelectedScene, useSelectedSceneTokens } from "./hooks.ts"

export function SceneProvider({ children }: { children: ReactNode }) {
	const [viewport, setViewport] = useState({
		offset: Vector.zero,
		scaleTick: 0,
	})
	const [tokenDragOffset, setTokenDragOffset] = useState(Vector.zero)
	const tokenSelectStore = useDragSelectStore<ApiToken["key"]>()

	const scene = useSelectedScene()
	const tokens = useSelectedSceneTokens()

	const viewportScale = scaleAt(viewport.scaleTick)

	const selectedTokens = tokens.filter((it) =>
		tokenSelectStore.isSelected(it.key),
	)
	const isDraggingTokens = !tokenDragOffset.equals(Vector.zero)

	function scaleAt(tick: number) {
		return 1.3 ** tick
	}

	function mapPositionFromViewportPosition(...position: VectorInputArgs) {
		return Vector.from(...position)
			.minus(viewport.offset)
			.dividedBy(viewportScale)
	}

	const sceneProperties = {
		cellSize: scene?.cellSize ?? 70,
	}

	const viewportProperties = {
		offset: viewport.offset,
		scale: viewportScale,

		move: (delta: VectorInput) => {
			setViewport((current) => ({
				...current,
				offset: current.offset.plus(delta),
			}))
		},

		zoom: (delta: number, pivotInput: VectorInput) => {
			setViewport((current) => {
				const newScaleTick = clamp(
					current.scaleTick + Math.sign(delta),
					-10,
					10,
				)
				if (newScaleTick === current.scaleTick) {
					return current
				}

				const pivot = Vector.from(pivotInput).minus(current.offset)
				const shift = pivot.minus(
					pivot.times(scaleAt(newScaleTick) / scaleAt(current.scaleTick)),
				)
				return {
					...current,
					scaleTick: newScaleTick,
					offset: current.offset.plus(shift),
				}
			})
		},
	}

	const sceneState = {
		scene: sceneProperties,
		mapPositionFromViewportPosition,
		tokenSelectStore,
		tokenDragOffset,
		setTokenDragOffset,
		tokens,
		selectedTokens,
		isDraggingTokens,
		viewport: viewportProperties,
	}

	return <SceneContext value={sceneState}>{children}</SceneContext>
}

export function useSceneContext() {
	const context = use(SceneContext)
	if (context === undefined) {
		throw new Error("SceneContext not found")
	}
	return context
}
