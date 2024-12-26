import { useSearchParams } from "react-router"
import { useMutation, useQuery } from "convex/react"
import {
	LucideEdit,
	LucideEye,
	LucideImagePlus,
	LucidePlay,
	LucideTrash,
} from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import { Button } from "~/components/Button.tsx"
import { Menu } from "~/components/Menu.tsx"
import { api } from "~/convex/_generated/api.js"
import { interactivePanel } from "~/styles/panel.ts"
import { secondaryHeading, subText } from "~/styles/text.ts"
import { ToastActionForm } from "../../components/ToastActionForm.tsx"
import { getImageUrl } from "../images/getImageUrl.ts"
import { SearchListLayout } from "../inventory/SearchListLayout.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { SceneEditorDialog } from "./SceneEditorDialog.tsx"
import { ApiScene } from "./types.ts"

export function SceneList() {
	const room = useRoomContext()
	const scenes = useQuery(api.scenes.list, { roomId: room._id })
	const [search, setSearch] = useState("")
	const filteredScenes = matchSorter(scenes ?? [], search, {
		keys: ["name", "mode"],
	})
	const [editorOpen, setEditorOpen] = useState(false)
	const [editingSceneId, setEditingSceneId] = useState<ApiScene["_id"]>()
	const editingScene = scenes?.find((it) => it._id === editingSceneId)
	const createScene = useMutation(api.scenes.create)
	const deleteScene = useMutation(api.scenes.remove)
	const updateRoom = useMutation(api.rooms.update)
	const [searchParams, setSearchParams] = useSearchParams()

	const renderScene = (scene: ApiScene) => {
		const isActive = room.activeSceneId === scene._id
		const isPreviewing = searchParams.get("scene") === scene._id
		return (
			<div key={scene._id} className="flex items-center gap-2">
				<Menu
					render={
						<button
							type="button"
							className={interactivePanel(
								"relative flex h-24 flex-col items-center justify-center",
							)}
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
									"line-clamp-2 text-balance px-2 drop-shadow",
								)}
							>
								{scene.name}
							</span>
							{isActive ? (
								<span className={subText("relative flex items-center gap-1")}>
									<LucidePlay className="size-4" /> Active
								</span>
							) : isPreviewing ? (
								<span className={subText("relative flex items-center gap-1")}>
									<LucideEye className="size-4" /> Previewing
								</span>
							) : null}
						</button>
					}
					className="flex-1"
					providerProps={{
						placement: "right",
					}}
					options={[
						!isActive && {
							icon: <LucidePlay />,
							label: "Set Active",
							onClick: async () => {
								await updateRoom({ roomId: room._id, activeSceneId: scene._id })
								setSearchParams((params) => {
									params.delete("scene")
									return params
								})
							},
						},
						!isPreviewing && {
							icon: <LucideEye />,
							label: "Preview",
							onClick: () => {
								setSearchParams((params) => {
									params.set("scene", scene._id)
									return params
								})
							},
						},
						{
							icon: <LucideEdit />,
							label: "Edit",
							onClick: () => {
								setEditingSceneId(scene._id)
								setEditorOpen(true)
							},
						},
						{
							icon: <LucideTrash />,
							label: "Delete",
							onClick: () => deleteScene({ sceneIds: [scene._id] }),
						},
					].filter(Boolean)}
				/>
			</div>
		)
	}

	return (
		<>
			<SearchListLayout
				items={filteredScenes}
				itemKey="_id"
				renderItem={renderScene}
				onSearch={(search: string) => {
					setSearch(search)
				}}
				actions={
					<ToastActionForm
						action={async () => {
							const id = await createScene({ roomId: room._id })
							setEditorOpen(true)
							setEditingSceneId(id)
						}}
					>
						<Button type="submit" icon={<LucideImagePlus />} appearance="clear">
							<span className="sr-only">Create scene</span>
						</Button>
					</ToastActionForm>
				}
			/>
			{editingScene && (
				<SceneEditorDialog
					open={editorOpen}
					setOpen={setEditorOpen}
					scene={editingScene}
				/>
			)}
		</>
	)
}
