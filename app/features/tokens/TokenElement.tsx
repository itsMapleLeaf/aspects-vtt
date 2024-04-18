import * as Lucide from "lucide-react"
import { use, useRef } from "react"
import { useAsyncState } from "#app/common/useAsyncState.js"
import { useDrag } from "#app/common/useDrag.js"
import { Vector } from "#app/common/vector.ts"
import type { Token } from "#convex/token.js"
import { useRoom } from "../rooms/roomContext.tsx"
import { OffsetContext, ZoomContext } from "./context.tsx"

export function TokenElement({
	token,
	size,
	children,
	attachments,
	onPointerDown,
	onDoubleClick,
	onMove,
}: {
	token: Token
	size: Vector
	children: React.ReactNode
	attachments?: React.ReactNode
	onPointerDown?: (event: PointerEvent) => void
	onDoubleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
	onMove?: (newGridPosition: Vector) => Promise<unknown>
}) {
	const room = useRoom()
	const offset = use(OffsetContext)
	const zoom = use(ZoomContext)
	const [moveState, move] = useAsyncState((newPosition: Vector) => onMove?.(newPosition))
	const tokenPosition = Vector.from(moveState.args ?? token.position)

	const buttonRef = useRef<HTMLButtonElement>(null)
	const drag = useDrag(buttonRef, {
		onStart: (event) => onPointerDown?.(event),
		onFinish: ({ distance }) => {
			move(tokenPosition.plus(distance.dividedBy(zoom).dividedBy(room.mapCellSize)).rounded)
		},
	})

	let visualPosition = tokenPosition.times(room.mapCellSize * zoom).plus(offset)
	if (drag) {
		visualPosition = visualPosition.plus(drag.distance)
	}

	return (
		<div className="pointer-events-none">
			<div
				data-dragging={!!drag}
				className="absolute left-0 top-0 rounded ease-out data-[dragging=true]:duration-0"
				style={{
					width: size.x * zoom,
					height: size.y * zoom,
					transform: `translate(${visualPosition.x}px, ${visualPosition.y}px)`,
					transformOrigin: "left top",
				}}
			>
				<button
					type="button"
					ref={buttonRef}
					className="pointer-events-auto size-full"
					onDoubleClick={onDoubleClick}
				>
					{children}
				</button>
				<div className="absolute inset-0 flex items-center justify-center">
					<Lucide.EyeOff
						data-hidden={!token.visible}
						className="size-8 opacity-0 transition-opacity data-[hidden=true]:opacity-100"
					/>
				</div>
			</div>
			<div
				data-dragging={!!drag}
				className="absolute left-0 top-0 z-10 rounded ease-out data-[dragging=true]:duration-0"
				style={{
					width: size.x * zoom,
					height: size.y * zoom,
					transform: `translate(${visualPosition.x}px, ${visualPosition.y}px)`,
					transformOrigin: "left top",
				}}
			>
				{attachments}
			</div>
		</div>
	)
}
