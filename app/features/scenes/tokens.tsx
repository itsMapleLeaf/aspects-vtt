import { useGesture } from "@use-gesture/react"
import type { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types"
import { useMutation, useQuery } from "convex/react"
import { LucideHeart } from "lucide-react"
import { Fragment, useState } from "react"
import { api } from "../../../convex/_generated/api"
import type { ApiToken } from "../../../convex/scenes/tokens.ts"
import { patchByKey } from "../../common/collection.ts"
import { applyOptimisticQueryUpdates } from "../../common/convex.ts"
import type { StoreState } from "../../common/store.tsx"
import { Vector } from "../../common/vector.ts"
import {
	ContextMenu,
	ContextMenuItem,
	ContextMenuPanel,
	ContextMenuTrigger,
} from "../../ui/ContextMenu.tsx"
import {
	DragSelectArea,
	type DragSelectStore,
	DragSelectable,
	useDragSelectStore,
} from "../../ui/DragSelect.tsx"
import { UploadedImage } from "../images/UploadedImage.tsx"
import type { ApiScene } from "./types.ts"
import { ViewportStore } from "./viewport.tsx"

export function SceneTokens({ scene }: { scene: ApiScene }) {
	const viewport = ViewportStore.useState()
	const tokens = useQuery(api.scenes.tokens.list, { sceneId: scene._id })
	const [dragOffset, setDragOffset] = useState(Vector.zero)
	const updateToken = useUpdateTokenMutation()
	const dragSelectStore = useDragSelectStore<ApiToken["key"]>()

	const bindDrag = useGesture(
		{
			onDrag: (state) => {
				setDragOffset(Vector.from(state.movement))
			},
			onDragEnd: (state) => {
				for (const token of tokens?.filter((it) => dragSelectStore.selected.has(it.key)) ?? []) {
					const position = Vector.from(token.position).plus(dragOffset).roundedTo(scene.cellSize).xy
					updateToken({
						sceneId: scene._id,
						key: token.key,
						position: position,
					})
				}
				setDragOffset(Vector.zero)
			},
		},
		{
			drag: {
				from: [0, 0],
			},
			transform: (input) => [
				...Vector.from(input).minus(viewport.offset).dividedBy(viewport.scale).tuple,
			],
		},
	)

	return (
		<DragSelectArea className="absolute inset-0 size-full" store={dragSelectStore}>
			{tokens?.map((token) => (
				<Fragment key={token.key}>
					{token.character && (
						<TokenBase
							{...{
								scene,
								token,
								viewport,
								bindDrag,
								dragSelectStore,
								offset: dragSelectStore.isSelected(token.key) ? dragOffset : Vector.zero,
							}}
						>
							<UploadedImage
								id={token.character.imageId}
								style={{
									width: scene.cellSize,
									height: scene.cellSize,
								}}
								className={{
									container: "overflow-clip rounded shadow-md shadow-black/50",
									image: "object-top object-cover",
								}}
							/>
						</TokenBase>
					)}
				</Fragment>
			))}
		</DragSelectArea>
	)
}

function TokenBase({
	token,
	scene,
	viewport,
	offset,
	bindDrag,
	dragSelectStore,
	children,
}: {
	token: ApiToken
	scene: ApiScene
	viewport: StoreState<typeof ViewportStore>
	offset: Vector
	bindDrag: (...args: unknown[]) => ReactDOMAttributes
	dragSelectStore: DragSelectStore<ApiToken["key"]>
	children: React.ReactNode
}) {
	const translation = Vector.from(token.position)
		.roundedTo(scene.cellSize)
		.plus(offset)
		.times(viewport.scale)
		.plus(viewport.offset)

	return (
		<div
			className="absolute left-0 top-0 origin-top-left touch-none"
			style={{ translate: `${translation.x}px ${translation.y}px`, scale: viewport.scale }}
		>
			<ContextMenu>
				<ContextMenuTrigger className="relative">
					<DragSelectable
						{...bindDrag()}
						className="group touch-none rounded"
						store={dragSelectStore}
						item={token.key}
					>
						{children}
						<div className="pointer-events-none absolute inset-0 rounded bg-primary-600/25 opacity-0 outline outline-4 outline-primary-700 group-data-[selected]:opacity-100" />
					</DragSelectable>
				</ContextMenuTrigger>
				<ContextMenuPanel>
					<ContextMenuItem text="Test" icon={<LucideHeart />} />
				</ContextMenuPanel>
			</ContextMenu>
		</div>
	)
}

function useUpdateTokenMutation() {
	return useMutation(api.scenes.tokens.update).withOptimisticUpdate((store, args) => {
		applyOptimisticQueryUpdates(store, api.scenes.tokens.list, (items) =>
			patchByKey(items, "key", args).toArray(),
		)
	})
}
