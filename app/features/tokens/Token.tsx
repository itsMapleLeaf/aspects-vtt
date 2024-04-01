import { useMergeRefs } from "@floating-ui/react"
import { type UseFloatingOptions, autoUpdate, offset, useFloating } from "@floating-ui/react-dom"
import * as Lucide from "lucide-react"
import { type CSSProperties, use, useRef } from "react"
import { twMerge } from "tailwind-merge"
import { useDrag } from "#app/common/useDrag.js"
import { useMutationState } from "#app/common/useMutationState.js"
import { Vector } from "#app/common/vector.ts"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { api } from "#convex/_generated/api.js"
import type { ResultQueryData } from "#convex/resultResponse.js"
import { useRoom } from "../rooms/roomContext.tsx"
import { ZoomContext } from "./context.tsx"

export function Token({
	character,
	selected,
	onSelect,
	...props
}: {
	character: ResultQueryData<typeof api.characters.list>[number]
	tokenPosition: Vector
	selected: boolean
	onSelect: () => void
}) {
	const room = useRoom()
	const zoom = use(ZoomContext)

	const [updateCharacterState, updateCharacter] = useMutationState(api.characters.update)
	const tokenPosition = Vector.from(updateCharacterState.args?.tokenPosition ?? props.tokenPosition)

	const buttonRef = useRef<HTMLButtonElement>(null)
	const drag = useDrag(buttonRef, {
		onStart: () => onSelect(),
		onFinish: ({ distance }) => {
			if (selected) {
				updateCharacter({
					id: character._id,
					tokenPosition: tokenPosition.plus(distance.dividedBy(zoom).dividedBy(room.mapCellSize))
						.rounded.xy,
				})
			}
		},
	})

	let visualPosition = tokenPosition.times(room.mapCellSize)
	if (drag && selected) {
		visualPosition = visualPosition.plus(drag.distance.dividedBy(zoom))
	}

	const baseFloatingOptions: UseFloatingOptions = {
		strategy: "absolute",
		middleware: [offset(8)],
		whileElementsMounted: (...args) => autoUpdate(...args, { animationFrame: true }),
		// whileElementsMounted: autoUpdate,
	}

	const floatingName = useFloating({
		...baseFloatingOptions,
		placement: "bottom",
	})

	const floatingMeters = useFloating({
		...baseFloatingOptions,
		placement: "top",
	})

	const mergedButtonRef = useMergeRefs([
		floatingName.refs.setReference,
		floatingMeters.refs.setReference,
		buttonRef,
	])

	return (
		<div
			data-dragging={!!drag}
			className="group contents *:absolute *:left-0 *:top-0 *:translate-x-[--x] *:translate-y-[--y] *:transition *:ease-out *:data-[dragging=true]:duration-0"
			style={
				{
					"--x": `${visualPosition.x}px`,
					"--y": `${visualPosition.y}px`,
					"--scale": 1 / zoom,
				} as CSSProperties
			}
		>
			<button
				type="button"
				data-selected={selected}
				className="flex items-center justify-center rounded outline outline-[length:calc(clamp(3px,var(--scale)*3px,8px))] outline-transparent data-[selected=true]:outline-primary-700 "
				style={{ width: room.mapCellSize, height: room.mapCellSize }}
				ref={mergedButtonRef}
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

			{selected && (
				<div className="pointer-events-none relative z-10">
					<div ref={floatingName.refs.setFloating} style={floatingName.floatingStyles}>
						<p
							data-selected={selected}
							className="max-w-48 origin-top scale-[--scale] text-balance rounded bg-primary-100/75 px-2 py-1.5 text-center leading-6 opacity-0 transition-transform ease-out empty:hidden data-[selected=true]:opacity-100"
						>
							{character.name} {character.pronouns && `(${character.pronouns})`}
						</p>
					</div>
				</div>
			)}

			<div className="pointer-events-none relative z-10 scale-[--scale]">
				<div
					ref={floatingMeters.refs.setFloating}
					style={floatingMeters.floatingStyles}
					className="flex w-24  flex-col gap-1.5"
				>
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
						.map((item) => ({ ...item, ratio: item.ratio ?? 0 }))
						.filter((item) => item.ratio > 0)
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
