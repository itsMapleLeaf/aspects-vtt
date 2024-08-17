import { Vector } from "../../../common/Vector.ts"
import type { ApiToken } from "../../../convex/scenes/tokens/functions.ts"
import { useSceneContext } from "./SceneContext.tsx"

export function useGetTokenViewportPosition() {
	const context = useSceneContext()
	return (token: ApiToken) => {
		const isSelected = context.tokenSelectStore.isSelected(token.key)
		return Vector.from(token.position)
			.roundedTo(context.scene.cellSize / context.placementSubdivisions)
			.times(context.viewport.scale)
			.plus(
				isSelected ?
					context.tokenDragOffset.times(context.viewport.scale)
				:	Vector.zero,
			)
			.css.translate()
	}
}
