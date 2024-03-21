import { autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom"
import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useRef } from "react"
import { useDrag } from "#app/common/useDrag.js"
import { Vector } from "#app/common/vector.ts"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { api } from "#convex/_generated/api.js"
import type { ResultQueryData } from "#convex/resultResponse.js"
import { useRoom } from "../rooms/roomContext.tsx"
import { cellSize, mapSize } from "./TokenMap.tsx"

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
						.plus(distance.dividedBy(cellSize))
						.clamp(Vector.zero, mapSize.minus(1)).rounded.xy,
				})
			}
		},
	})

	let visualPosition = Vector.from(character.tokenPosition).times(cellSize)
	if (drag && selected) {
		visualPosition = visualPosition.plus(drag.distance)
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
			className="absolute top-0 left-0"
			style={{
				width: cellSize,
				height: cellSize,
				translate: `${visualPosition.x}px ${visualPosition.y}px`,
			}}
		>
			<div
				data-selected={selected}
				ref={refs.setReference}
				className="group relative size-full outline outline-2 outline-transparent data-[selected=true]:outline-primary-600"
			>
				<button type="button" className="size-full" ref={ref}>
					<UploadedImage
						id={character.imageId}
						emptyIcon={<Lucide.Ghost />}
						className="size-full"
						draggable={false}
					/>
				</button>

				<p className="-translate-x-1/2 pointer-events-none absolute top-full left-1/2 w-max max-w-48 translate-y-2 text-balance rounded bg-primary-100/75 p-1.5 leading-none opacity-0 empty:hidden [button:hover~&]:opacity-100 group-data-[selected=true]:opacity-100">
					{character.name}
				</p>

				{/* TODO: decide  if and how I want to show stress bars */}
				{/* <div className="-translate-x-1/2 -translate-y-2 pointer-events-none absolute bottom-full left-1/2 z-10 h-2.5 w-10 rounded border border-red-500 p-px opacity-50">
                <div
                    className="h-full origin-left rounded-sm bg-red-600"
                    style={{
                        scale: `${1 - character.damage / (20 + character.strength)} 1`,
                    }}
                />
            </div> */}
			</div>
		</div>
	)
}
