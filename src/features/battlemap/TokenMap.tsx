import { useMutation, useQuery } from "convex/react"
import { clamp, omit } from "lodash-es"
import { useState } from "react"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { readonly } from "~/lib/common.ts"
import { keyBy } from "~/lib/iterable.ts"
import { Rect } from "~/lib/rect.ts"
import { useAsyncQueue } from "~/lib/useAsyncQueue.ts"
import { Vec, VecInput } from "~/shared/vec.ts"
import { useDrag } from "../../lib/useDrag.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { ApiScene } from "../scenes/types.ts"
import { CharacterTokenElement } from "./CharacterTokenElement.tsx"
import { ApiToken } from "./types.ts"

export function TokenMap({ scene }: { scene: ApiScene }) {
	const viewport = useViewport()

	const toTokenPosition = (input: VecInput) =>
		Vec.from(input).minus(viewport.offset).dividedBy(viewport.scale)

	const [selectedTokenIds, setSelectedTokenIds] = useState(
		readonly(new Set<Id<"characterTokens">>()),
	)

	const baseTokens = useQuery(api.tokens.list, { sceneId: scene._id }) ?? []
	const updateTokens = useAsyncQueue(useMutation(api.tokens.update))

	const pendingTokenUpdates = new Map<
		Id<"characterTokens">,
		Omit<Partial<ApiToken>, "characterId">
	>()

	for (const run of updateTokens.queue) {
		for (const { tokenId, characterId: _, ...rest } of run.args.updates) {
			// merge existing updates with new ones,
			// to avoid erasing the previous pending state for this token,
			// e.g. there might be a pending token movement in flight,
			// and not doing this means that movement will Die
			// if we don't explicitly keep the pending position
			pendingTokenUpdates.set(tokenId, {
				...pendingTokenUpdates.get(tokenId),
				...rest,
			})
		}
	}

	const tokenDrag = useDrag<{ token: ApiToken }>({
		button: "primary",
		onStart: ({ info }) => {
			const newSelectedTokenIds = selectedTokenIds.has(info.token._id)
				? selectedTokenIds
				: new Set([info.token._id])

			setSelectedTokenIds(newSelectedTokenIds)

			updateTokens({
				updates: [...newSelectedTokenIds].map((tokenId) => ({
					tokenId,
					updatedAt: Date.now(),
				})),
			})
		},
		onEnd: () => {
			updateTokens({
				updates: selectedTokens.map((token) => ({
					tokenId: token._id,
					position: token.position.toJSON(),
				})),
			})
		},
	})

	const tokens = baseTokens
		.map((token) => ({
			...token,
			...omit(pendingTokenUpdates.get(token._id), ["tokenId", "characterId"]),
		}))
		.map((token) => ({
			...token,
			position: Vec.sum(
				token.position,
				selectedTokenIds.has(token._id)
					? tokenDrag.movedActive.dividedBy(viewport.scale)
					: 0,
			),
		}))
		.sort((a, b) => a.updatedAt - b.updatedAt)

	const tokensById = keyBy(tokens, (t) => t._id)
	const selectedTokens = [...selectedTokenIds]
		.map((id) => tokensById.get(id))
		.filter(Boolean)

	const selectionDrag = useDrag({
		button: "primary",
		onEnd: ({ start, end, cancelled }) => {
			if (cancelled) return
			const area = Rect.bounds(toTokenPosition(start), toTokenPosition(end))
			setSelectedTokenIds(
				new Set(
					tokens
						.filter((it) => area.intersects([it.position, scene.cellSize]))
						.map((it) => it._id),
				),
			)
		},
	})

	const characterTokens = tokens.flatMap((token) =>
		token.characterId ? [token] : [],
	)

	return (
		<div
			{...viewport.drag.handlers()}
			className="absolute inset-0 touch-none select-none overflow-clip"
			onWheel={viewport.handleWheel}
		>
			<div
				className="pointer-events-none absolute inset-0 origin-top-left"
				style={{
					transform: `translate(${viewport.offset.toCSSPixels()}) scale(${viewport.scale})`,
				}}
			>
				{scene.battlemapBackgroundId && (
					<img
						src={getImageUrl(scene.battlemapBackgroundId)}
						alt=""
						className="max-w-none"
						draggable={false}
					/>
				)}
			</div>

			<div className="absolute inset-0" {...selectionDrag.handlers()}></div>

			<div
				className="pointer-events-children absolute inset-0 origin-top-left"
				style={{
					transform: `translate(${viewport.offset.toCSSPixels()}) scale(${viewport.scale})`,
				}}
			>
				{characterTokens.map((token) => (
					<CharacterTokenElement
						key={token._id}
						token={token}
						character={token.character}
						scene={scene}
						selected={selectedTokenIds.has(token._id)}
						{...tokenDrag.handlers({ token })}
					/>
				))}
			</div>

			<div
				className="pointer-events-none rounded-sm border-2 border-accent-900 bg-accent-600/50 opacity-0 transition-opacity"
				style={{
					width: `${selectionDrag.area.width}px`,
					height: `${selectionDrag.area.height}px`,
					transform: `translate(${selectionDrag.area.topLeft.toCSSPixels()})`,
					...(selectionDrag.active && {
						opacity: 1,
						transitionDuration: "0",
					}),
				}}
			/>
		</div>
	)
}

function useViewport() {
	const [state, setState] = useState({
		offset: Vec.zero,
		zoom: 0,
	})

	const drag = useDrag({
		button: "secondary",
		onEnd: ({ moved }) => {
			setState((state) => ({
				...state,
				offset: state.offset.plus(moved),
			}))
		},
	})

	const scaleCoefficient = 1.3
	const scale = scaleCoefficient ** state.zoom
	const offset = state.offset.plus(drag.movedActive)

	const handleWheel = (event: React.WheelEvent) => {
		if (event.deltaY === 0) return
		const delta = Math.round(event.deltaY / 100) * -1

		setState((state) => {
			const pointerOffset = Vec.from(event.nativeEvent).minus(offset)
			const nextViewportZoom = clamp(state.zoom + delta, -10, 10)

			const currentViewportScale = scaleCoefficient ** state.zoom
			const nextViewportScale = scaleCoefficient ** nextViewportZoom
			const scaleRatio = nextViewportScale / currentViewportScale

			return {
				...state,
				zoom: nextViewportZoom,
				offset: state.offset.plus(pointerOffset.times(1 - scaleRatio)),
			}
		})
	}

	return { offset, scale, drag, handleWheel }
}
