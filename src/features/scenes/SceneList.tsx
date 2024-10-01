import { useMutation, useQuery } from "convex/react"
import {
	LucideEdit,
	LucideImagePlus,
	LucidePlay,
	LucideTrash,
} from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import { Button } from "~/components/Button.tsx"
import { Menu } from "~/components/Menu.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { interactivePanel } from "~/styles/panel.ts"
import { secondaryHeading } from "~/styles/text.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { SearchListLayout } from "../inventory/SearchListLayout.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { EditorScene, SceneEditorDialog } from "./SceneEditorDialog.tsx"
import { ApiScene } from "./types.ts"

export function SceneList() {
	const room = useRoomContext()
	const scenesQuery = useQuery(api.scenes.list, { roomId: room._id })
	const [search, setSearch] = useState("")
	const scenes = matchSorter(scenesQuery ?? [], search, {
		keys: ["name", "mode"],
	})
	const [editingScene, setEditingScene] = useState<EditorScene>()
	const [editorOpen, setEditorOpen] = useState(false)
	const deleteScene = useMutation(api.scenes.remove)
	const updateRoom = useMutation(api.rooms.update)

	const renderScene = (scene: ApiScene) => (
		<div key={scene._id} className="flex items-center gap-2">
			<Menu
				render={
					<button
						type="button"
						className={interactivePanel("relative grid h-20")}
					>
						{scene.battlemapBackgroundId && (
							<img
								src={getImageUrl(scene.battlemapBackgroundId)}
								alt=""
								className="absolute inset-0 size-full rounded-[inherit] object-cover brightness-50"
							/>
						)}
						<span
							className={secondaryHeading(
								"absolute line-clamp-2 place-self-center text-balance px-2 drop-shadow",
							)}
						>
							{scene.name}
						</span>
					</button>
				}
				className="flex-1"
				providerProps={{
					placement: "right",
				}}
				options={[
					{
						icon: <LucidePlay />,
						label: "Set Active",
						onClick: () =>
							((sceneId: Id<"scenes">) => {
								updateRoom({ roomId: room._id, activeSceneId: sceneId })
							})(scene._id),
					},
					{
						icon: <LucideEdit />,
						label: "Edit",
						onClick: () => {
							setEditingScene(scene)
							setEditorOpen(true)
						},
					},
					{
						icon: <LucideTrash />,
						label: "Delete",
						onClick: () =>
							((sceneId: Id<"scenes">) => {
								deleteScene({ sceneIds: [sceneId] })
							})(scene._id),
					},
				]}
			/>
		</div>
	)

	return (
		<>
			<SearchListLayout
				items={scenes}
				itemKey="_id"
				renderItem={renderScene}
				onSearch={(search: string) => {
					setSearch(search)
				}}
				actions={
					<Button
						type="submit"
						icon={<LucideImagePlus />}
						appearance="clear"
						onClick={() => {
							setEditingScene({
								name: "New Scene",
								mode: "scenery",
							})
							setEditorOpen(true)
						}}
					>
						<span className="sr-only">Create scene</span>
					</Button>
				}
			/>
			{editingScene && (
				<SceneEditorDialog
					open={editorOpen}
					setOpen={setEditorOpen}
					scene={editingScene}
					onSubmitSuccess={() => {
						setEditorOpen(false)
						setEditingScene(undefined)
					}}
				/>
			)}
		</>
	)
}
