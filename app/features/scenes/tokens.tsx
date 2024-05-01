import { useGesture } from "@use-gesture/react"
import { useMutation, useQuery } from "convex/react"
import { LucideHeart } from "lucide-react"
import { Fragment, type ReactElement, useRef, useState } from "react"
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
import { DragSelectArea, DragSelectable } from "../../ui/DragSelect.tsx"
import { UploadedImage } from "../images/UploadedImage.tsx"
import type { ApiScene } from "./types.ts"
import { ViewportStore } from "./viewport.tsx"

export function SceneTokens({ scene }: { scene: ApiScene }) {
	const viewport = ViewportStore.useState()
	const tokens = useQuery(api.scenes.tokens.list, { sceneId: scene._id })
	return (
		<DragSelectArea className="absolute inset-0 size-full">
			{tokens?.map((token) => (
				<Fragment key={token.key}>
					{token.character && (
						<TokenBase {...{ scene, token, viewport }}>
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
	children,
}: {
	token: ApiToken
	scene: ApiScene
	viewport: StoreState<typeof ViewportStore>
	children: ReactElement
}) {
	const [offset, setOffset] = useState(Vector.zero)
	const updateToken = useUpdateTokenMutation()
	const ref = useRef<HTMLDivElement>(null)

	const translation = Vector.from(token.position)
		.roundedTo(scene.cellSize)
		.plus(offset)
		.times(viewport.scale)
		.plus(viewport.offset)

	const bind = useGesture(
		{
			onDrag: (state) => {
				setOffset((offset) => offset.plus(state.delta))
			},
			onDragEnd: (state) => {
				const position = Vector.from(token.position).plus(offset).roundedTo(scene.cellSize).xy
				// debugger
				updateToken({
					sceneId: scene._id,
					key: token.key,
					position: position,
				})
				setOffset(Vector.zero)
			},
		},
		{
			transform: (input) => [
				...Vector.from(input).minus(viewport.offset).dividedBy(viewport.scale).tuple,
			],
		},
	)

	return (
		<div
			{...bind()}
			ref={ref}
			className="absolute left-0 top-0 origin-top-left touch-none"
			style={{ translate: `${translation.x}px ${translation.y}px`, scale: viewport.scale }}
		>
			<ContextMenu>
				<ContextMenuTrigger className="relative">
					<DragSelectable className="group rounded">
						{children}
						<div className="absolute inset-0 rounded bg-primary-600/25 opacity-0 outline outline-4 outline-primary-700 group-data-[selected]:opacity-100" />
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
