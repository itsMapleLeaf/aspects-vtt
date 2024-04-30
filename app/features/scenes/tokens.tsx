import { useQuery } from "convex/react"
import type { ComponentProps } from "react"
import { api } from "../../../convex/_generated/api"
import type { ApiToken } from "../../../convex/scenes/tokens.ts"
import type { StrictOmit } from "../../common/types.ts"
import { Vector } from "../../common/vector.ts"
import type { ApiScene } from "./types.ts"
import { ViewportStore } from "./viewport.tsx"

export function SceneTokens({
	scene,
	...props
}: StrictOmit<ComponentProps<"div">, "children"> & { scene: ApiScene }) {
	const viewport = ViewportStore.useState()
	const tokens = useQuery(api.scenes.tokens.list, { sceneId: scene._id })

	function getTokenTranslation(token: ApiToken) {
		const { x, y } = Vector.from(token.position.x, token.position.y)
			.times(viewport.scale)
			.plus(viewport.offset)
		return `${x}px ${y}px`
	}

	return (
		<div {...props} className="absolute inset-0 size-full">
			{tokens?.map((token) => (
				<div
					key={token.key}
					style={{
						width: scene.cellSize,
						height: scene.cellSize,
						scale: viewport.scale,
						translate: getTokenTranslation(token),
					}}
					className="absolute left-0 top-0 origin-top-left rounded bg-blue-500 shadow-md shadow-black/50"
				/>
			))}
		</div>
	)
}
