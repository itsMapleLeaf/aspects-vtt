import { autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom"
import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { type CSSProperties, use, useRef } from "react"
import { twMerge } from "tailwind-merge"
import { useDrag } from "#app/common/useDrag.js"
import { Vector } from "#app/common/vector.ts"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { api } from "#convex/_generated/api.js"
import type { ResultQueryData } from "#convex/resultResponse.js"
import { useRoom } from "../rooms/roomContext.tsx"
import { ZoomContext } from "./TokenMapViewport.tsx"

export function Token({
	character,
	selected,
	onSelect,
}: {
	character: ResultQueryData<typeof api.characters.listTokens>[number]
	selected: boolean
	onSelect: () => void
}) {
	const room = useRoom()
	const zoom = use(ZoomContext)

	const updateCharacter = useMutation(api.characters.update).withOptimisticUpdate((store, args) => {
		const characters = store.getQuery(api.characters.listTokens, { roomId: room._id })
		if (!characters?.data) return
		store.setQuery(
			api.characters.listTokens,
			{ roomId: room._id },
			{
				ok: true,
				data: characters.data.map((c) =>
					c._id === args.id ? { ...c, tokenPosition: args.tokenPosition ?? c.tokenPosition } : c,
				),
			},
		)
	})

	const ref = useRef<HTMLButtonElement>(null)
	const drag = useDrag(ref, {
		onStart: () => onSelect(),
		onFinish: ({ distance }) => {
			if (selected) {
				updateCharacter({
					id: character._id,
					tokenPosition: Vector.from(character.tokenPosition)
						.plus(distance.dividedBy(zoom).dividedBy(room.mapCellSize))
						.clamp(
							Vector.zero,
							Vector.from(room.mapDimensions).dividedBy(room.mapCellSize).minus(1),
						).rounded.xy,
				})
			}
		},
	})

	let visualPosition = Vector.from(character.tokenPosition).times(room.mapCellSize)
	if (drag && selected) {
		visualPosition = visualPosition.plus(drag.distance.dividedBy(zoom))
	}

	const { refs, floatingStyles } = useFloating({
		placement: "right",
		strategy: "fixed",
		middleware: [
			offset(8),
			shift({
				crossAxis: true,
				padding: 16,
			}),
		],
		whileElementsMounted: (...args) => autoUpdate(...args, { animationFrame: true }),
	})

	return (
		<div
			className="absolute top-0 left-0 transition-[translate] ease-out data-[dragging=true]:duration-0"
			data-dragging={!!drag}
			style={{
				width: room.mapCellSize,
				height: room.mapCellSize,
				translate: `${visualPosition.x}px ${visualPosition.y}px`,
			}}
		>
			<div
				ref={refs.setReference}
				className="group relative size-full outline outline-2 outline-transparent data-[selected=true]:outline-primary-600"
				data-selected={selected}
			>
				<button
					type="button"
					className="relative flex size-full items-center justify-center"
					ref={ref}
				>
					<UploadedImage
						id={character.imageId}
						emptyIcon={<Lucide.Ghost />}
						draggable={false}
						className="peer size-full transition-opacity data-[faded=true]:opacity-50"
						data-faded={room.isOwner && character.tokenVisibleTo !== "everyone"}
					/>
					<Lucide.EyeOff className="absolute size-8 opacity-0 transition-opacity peer-data-[faded=true]:opacity-100" />
				</button>

				<div
					style={{ scale: 1 / zoom }}
					className="pointer-events-none absolute inset-x-0 top-full flex origin-top justify-center text-balance p-2 opacity-0 transition-[scale] ease-out [button:hover~&]:opacity-100 group-data-[selected=true]:opacity-100"
				>
					<p className="rounded bg-primary-100/75 px-2 py-1.5 text-center leading-6 empty:hidden">
						{character.name}
					</p>
				</div>

				<div className="-translate-x-1/2 -translate-y-1.5 pointer-events-none absolute bottom-full left-1/2 z-10 flex w-11 flex-col gap-1.5">
					{[
						{
							ratio: character.damageRatio,
							className: twMerge(
								"[--end-color:theme(colors.red.500)] [--start-color:theme(colors.yellow.500)]",
							),
						},
						{
							ratio: character.fatigueRatio,
							className: twMerge(
								"[--end-color:theme(colors.purple.500)] [--start-color:theme(colors.green.400)]",
							),
						},
					]
						.flatMap((item) =>
							item.ratio != null && item.ratio > 0 ? { ...item, ratio: item.ratio } : [],
						)
						.map((item, i) => (
							<div
								key={i}
								className={twMerge(
									"h-2 w-full rounded-sm border border-current text-[color-mix(in_oklch,var(--start-color),var(--end-color)_var(--ratio))] transition-colors",
									item.className,
								)}
								style={{ "--ratio": `${item.ratio * 100}%` } as CSSProperties}
							>
								<div
									className="h-full origin-left bg-current transition-[background-color,scale]"
									style={{
										scale: `var(--ratio) 1`,
									}}
								/>
							</div>
						))}
				</div>
			</div>
		</div>
	)
}
