import { Vector } from "../../../common/Vector.ts"
import { useSceneContext } from "./SceneContext.tsx"
import { useCurrentRoomScene } from "./hooks.ts"

export function DistanceLayer() {
	const scene = useCurrentRoomScene()
	const context = useSceneContext()

	if (!scene) return
	if (!context.isDraggingTokens) return

	return context.selectedTokens.map((token) => {
		if (!token.character) return

		const start = Vector.from(token.position)
			.roundedTo(scene.cellSize)
			.times(context.viewport.scale)

		const end = start.plus(context.tokenDragOffset.times(context.viewport.scale))

		return (
			<>
				{/* horizontal line */}
				<div
					className="absolute left-0 top-0 box-content outline outline-4 outline-primary-800"
					style={{
						translate: Vector.from(Math.min(start.x, end.x), end.y)
							.plus((scene.cellSize * context.viewport.scale) / 2)
							.css.translate(),
						height: 0,
						width: Math.abs(end.x - start.x),
					}}
				/>

				{/* vertical line */}
				<div
					className="absolute left-0 top-0 box-content outline outline-4 outline-primary-800"
					style={{
						translate: Vector.from(start.x, Math.min(start.y, end.y))
							.plus((scene.cellSize * context.viewport.scale) / 2)
							.css.translate(),
						width: 0,
						height: Math.abs(end.y - start.y),
					}}
				/>

				{/* start dot */}
				<div
					className="absolute left-0 top-0 scale-[0.3] rounded-full bg-primary-800"
					style={{
						...Vector.from(scene.cellSize * context.viewport.scale).toSize(),
						translate: start.css.translate(),
					}}
				/>

				{/* end dot */}
				<div
					className="absolute left-0 top-0 scale-[0.3] rounded-full bg-primary-800"
					style={{
						...Vector.from(scene.cellSize * context.viewport.scale).toSize(),
						translate: end.css.translate(),
					}}
				/>
			</>
		)
	})
}

export function DistanceLabelLayer() {
	const scene = useCurrentRoomScene()
	const context = useSceneContext()

	if (!scene) return
	if (context.tokenDragOffset.equals(Vector.zero)) return

	return context.selectedTokens.map((token) => {
		if (!token.character) return

		// this game system uses manhattan distance
		const gridStart = Vector.from(token.position).dividedBy(scene.cellSize).rounded
		const gridEnd = gridStart.plus(context.tokenDragOffset.dividedBy(scene.cellSize)).rounded
		const distance = Math.abs(gridEnd.x - gridStart.x) + Math.abs(gridEnd.y - gridStart.y)

		return (
			<div
				key={token.key}
				className="flex-center absolute left-0 top-0"
				style={{
					...Vector.from(scene.cellSize * context.viewport.scale).toSize(),
					translate: Vector.from(token.position)
						.roundedTo(scene.cellSize)
						.plus(context.tokenDragOffset)
						.times(context.viewport.scale)
						.minus(0, scene.cellSize * context.viewport.scale * 0.8)
						.css.translate(),
				}}
			>
				<p className="rounded-md bg-black/50 p-2 text-xl/none font-bold text-white">{distance}m</p>
			</div>
		)
	})
}
