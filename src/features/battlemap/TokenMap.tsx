import { useMutation, useQuery } from "convex/react"
import { clamp, omit } from "lodash-es"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { ApiImage } from "~/components/ApiImage.tsx"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { Sprite } from "~/features/battlemap/Sprite.tsx"
import { readonly } from "~/lib/common.ts"
import { groupBy, keyBy } from "~/lib/iterable.ts"
import { useKeyPressed } from "~/lib/keyboard.ts"
import { Rect } from "~/lib/rect.ts"
import { useAsyncQueue } from "~/lib/useAsyncQueue.ts"
import { Vec, VecInput } from "~/shared/vec.ts"
import { useDrag } from "../../lib/useDrag.ts"
import { getConditionColorClasses } from "../characters/conditions.ts"
import { ApiScene } from "../scenes/types.ts"
import { ActivityTokenElement } from "./ActivityTokenElement.tsx"
import { CharacterTokenElement } from "./CharacterTokenElement.tsx"
import { ApiToken } from "./types.ts"

export function TokenMap({ scene }: { scene: ApiScene }) {
	const [viewportState, setViewportState] = useState({
		offset: Vec.zero,
		zoom: 0,
	})

	const viewportDrag = useDrag({
		button: "secondary",
		onEnd: ({ moved }) => {
			setViewportState((state) => ({
				...state,
				offset: state.offset.plus(moved),
			}))
		},
	})

	const viewportScaleCoefficient = 1.3
	const viewportScale = viewportScaleCoefficient ** viewportState.zoom
	const viewportOffset = viewportState.offset.plus(viewportDrag.movedActive)

	const handleWheel = (event: React.WheelEvent) => {
		if (event.deltaY === 0) return
		const delta = Math.round(event.deltaY / 100) * -1

		setViewportState((state) => {
			const pointerOffset = Vec.from(event.nativeEvent).minus(viewportOffset)
			const nextViewportZoom = clamp(state.zoom + delta, -10, 10)

			const currentViewportScale = viewportScaleCoefficient ** state.zoom
			const nextViewportScale = viewportScaleCoefficient ** nextViewportZoom
			const scaleRatio = nextViewportScale / currentViewportScale

			return {
				...state,
				zoom: nextViewportZoom,
				offset: state.offset.plus(pointerOffset.times(1 - scaleRatio)),
			}
		})
	}

	const toTokenPosition = (input: VecInput) =>
		Vec.from(input).minus(viewportOffset).dividedBy(viewportScale)

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
			position: Vec.from(token.position)
				.roundTo(scene.cellSize / 4)
				.plus(
					selectedTokenIds.has(token._id)
						? tokenDrag.movedActive.dividedBy(viewportScale)
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

	const tokenGroups = groupBy(tokens, (token) =>
		token.characterId ? "characters" : "activities",
	)

	const [visibleAnnotations, setVisibleAnnotations] = useState(
		new Map<Id<"characterTokens">, boolean>(),
	)
	const altPressed = useKeyPressed("Alt")

	function updateVisibleAnnotations(
		tokenId: Id<"characterTokens">,
		visible: boolean,
	) {
		setVisibleAnnotations((prev) => {
			const next = new Map(prev)
			next.set(tokenId, visible)
			return next
		})
	}

	return (
		<div
			{...viewportDrag.handlers()}
			className="absolute inset-0 touch-none select-none overflow-clip [&_*]:will-change-[transform,opacity]"
			onWheel={handleWheel}
		>
			<Sprite position={viewportOffset} scale={viewportScale}>
				{scene.battlemapBackgroundId && (
					<ApiImage
						imageId={scene.battlemapBackgroundId}
						className="max-w-none"
					/>
				)}
			</Sprite>

			<div className="absolute inset-0" {...selectionDrag.handlers()}></div>

			<Sprite position={viewportOffset} scale={viewportScale}>
				{tokenGroups.get("characters")?.map((token) => {
					if (!token.characterId) return
					return (
						<CharacterTokenElement
							key={token._id}
							token={token}
							character={token.character}
							scene={scene}
							selected={selectedTokenIds.has(token._id)}
							pointerEvents
							onPointerEnter={() => updateVisibleAnnotations(token._id, true)}
							onPointerLeave={() => updateVisibleAnnotations(token._id, false)}
							{...tokenDrag.handlers({ token })}
						/>
					)
				})}
				{tokenGroups
					.get("activities")
					?.map((token) => (
						<ActivityTokenElement
							key={token._id}
							token={token}
							scene={scene}
							selected={selectedTokenIds.has(token._id)}
							pointerEvents
							{...tokenDrag.handlers({ token })}
						/>
					))}
			</Sprite>

			<Sprite
				position={selectionDrag.area.topLeft}
				size={selectionDrag.area.size}
				className="rounded-sm border-2 border-accent-900 bg-accent-600/50 opacity-0 transition-opacity"
				style={{
					...(selectionDrag.active && {
						opacity: 1,
						transitionDuration: "0",
					}),
				}}
			/>

			<Sprite position={viewportOffset} pointerEvents={false}>
				{tokenGroups.get("characters")?.map((token) => {
					if (!token.characterId) return
					return (
						<Sprite
							key={token._id}
							position={Vec.from(token.position).times(viewportScale)}
							size={Vec.from(scene.cellSize).times(viewportScale)}
							// using opacity-95 because the browser (just Firefox?)
							// disables GPU rendering at 100,
							// which causes weird artifacts like pixel shifting
							// and also murders performance lol
							className="opacity-0 transition-opacity will-change-[opacity] data-[visible=true]:opacity-95"
							data-visible={
								visibleAnnotations.get(token._id) ||
								selectedTokenIds.has(token._id) ||
								altPressed
							}
						>
							<Sprite.Attachment side="top" className="p-4">
								<Sprite.Badge>
									<p className="text-base/5 empty:hidden">
										{token.character.identity?.name ?? (
											<span className="opacity-50">(unknown)</span>
										)}
									</p>
									<p className="text-sm/5 opacity-80 empty:hidden">
										{[token.character.race, token.character.identity?.pronouns]
											.filter(Boolean)
											.join(" • ")}
									</p>
								</Sprite.Badge>
							</Sprite.Attachment>
							<Sprite.Attachment
								side="bottom"
								className="items-center p-4 gap-1"
							>
								{token.character.full && (
									<div className="flex gap-1">
										<Sprite.Meter
											value={token.character.full.health}
											max={token.character.full.healthMax}
											className={{
												root: "border-green-700 bg-green-500/50",
												fill: "bg-green-500",
											}}
										/>
										<Sprite.Meter
											value={token.character.full.resolve}
											max={token.character.full.resolveMax}
											className={{
												root: "border-blue-700 bg-blue-500/50",
												fill: "bg-blue-500",
											}}
										/>
									</div>
								)}
								<div className="flex w-64 flex-wrap justify-center gap-1">
									{[...new Set(token.character.conditions)].map((condition) => (
										<Sprite.Badge
											key={condition}
											className={twMerge(
												"px-2.5 py-1 text-sm leading-4",
												getConditionColorClasses(condition),
											)}
										>
											{condition}
										</Sprite.Badge>
									))}
								</div>
							</Sprite.Attachment>
						</Sprite>
					)
				})}
			</Sprite>
		</div>
	)
}
