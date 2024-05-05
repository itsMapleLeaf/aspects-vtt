import { observer } from "mobx-react-lite"
import type { Doc } from "../../../convex/_generated/dataModel.js"
import { getApiImageUrl } from "../images/getApiImageUrl.tsx"
import { useViewport } from "./viewport.tsx"

export const SceneMapBackground = observer(function SceneMapBackground({
	scene,
}: { scene: Doc<"scenes"> }) {
	const viewport = useViewport()

	return scene.background ? (
		<img
			src={getApiImageUrl(scene.background)}
			alt=""
			draggable={false}
			style={{
				width: scene.backgroundDimensions?.x,
				height: scene.backgroundDimensions?.y,
				scale: viewport.scale,
				translate: `${viewport.offset.x}px ${viewport.offset.y}px`,
			}}
			className="max-w-[unset] origin-top-left"
		/>
	) : null
})
