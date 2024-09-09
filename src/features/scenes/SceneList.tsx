import { useNavigate } from "@remix-run/react"
import { useMutation } from "convex/react"
import {
	LucideEdit,
	LucideEye,
	LucideImageOff,
	LucideImagePlus,
	LucidePlay,
	LucideTrash,
	LucideX,
} from "lucide-react"
import { useState } from "react"
import { api } from "../../../convex/_generated/api.js"
import { Id } from "../../../convex/_generated/dataModel"
import { EMPTY_ARRAY, hasLength } from "../../lib/array.ts"
import { useStableQuery } from "../../lib/convex.tsx"
import { useSet } from "../../lib/react.ts"
import { ActionRow, ActionRowItem } from "../../ui/ActionRow.tsx"
import { FormButton } from "../../ui/FormButton.tsx"
import { PressEvent } from "../../ui/Pressable.tsx"
import { SearchableList } from "../../ui/SearchableList.tsx"
import { EmptyState } from "../../ui/empty-state.tsx"
import { Modal, ModalPanel } from "../../ui/modal.tsx"
import { clearButton, errorText } from "../../ui/styles.ts"
import { ToastActionForm } from "../../ui/toast.tsx"
import { SceneEditorForm } from "./SceneEditorForm"
import { SceneListCard } from "./SceneListCard"
import { SceneMenu, SceneMenuButton } from "./SceneMenu.tsx"

/**
 * Renders a searchable list of scenes in a room.
 *
 * Clicking on a scene opens a menu of actions for that scene:
 *
 * - Play: sets the active scene to this one
 * - Preview: lets the GM view the scene without changing the active scene
 * - Edit: opens the scene editor for this scene
 * - Duplicate: creates a new scene with the same content
 * - Delete: deletes the scene
 *
 * For power users, multiple scenes can be selected by ctrl-clicking or
 * shift-clicking. Then a delete button will appear at the bottom of the list to
 * delete all selected scenes.
 */
export function SceneList({ roomId }: { roomId: Id<"rooms"> }) {
	const [search, setSearch] = useState("")

	const [selectedSceneIds, selectedSceneIdActions] = useSet<Id<"scenes">>()
	const [lastSelectedSceneId, setLastSelectedSceneId] = useState<Id<"scenes">>()

	const [sceneEditorOpen, setSceneEditorOpen] = useState(false)
	const [sceneEditorSceneId, setSceneEditorSceneId] = useState<Id<"scenes">>()

	const scenes =
		useStableQuery(api.functions.scenes.list, {
			roomId,
			search,
		}) ?? EMPTY_ARRAY

	const createScene = useMutation(api.functions.scenes.create)
	const removeScenes = useMutation(api.functions.scenes.remove)
	const updateRoom = useMutation(api.functions.rooms.update)

	const navigate = useNavigate()

	const sceneEditorScene = scenes.find(
		(scene) => scene._id === sceneEditorSceneId,
	)

	const selectedScenes = scenes.filter((scene) =>
		selectedSceneIds.has(scene._id),
	)

	const openSceneEditor = (sceneId: Id<"scenes">) => {
		setSceneEditorSceneId(sceneId)
		setSceneEditorOpen(true)
	}

	const clearSelection = () => {
		selectedSceneIdActions.clear()
		setLastSelectedSceneId(undefined)
	}

	const handleScenePress = (sceneId: Id<"scenes">, event: PressEvent) => {
		// ctrl should toggle the scene
		if (event.ctrlKey) {
			selectedSceneIdActions.toggle(sceneId)
			return
		}

		// shift should do a range select from the last selected scene to the current one
		if (event.shiftKey) {
			const lastSelectedIndex = scenes.findIndex(
				(scene) => scene._id === lastSelectedSceneId,
			)
			const selectedIndex = scenes.findIndex((scene) => scene._id === sceneId)
			selectedSceneIdActions.set(
				new Set(
					scenes
						.slice(
							Math.min(lastSelectedIndex, selectedIndex),
							Math.max(lastSelectedIndex, selectedIndex) + 1,
						)
						.map((scene) => scene._id),
				),
			)
			return
		}

		openSceneEditor(sceneId)
	}

	return (
		<div className="relative flex h-full flex-col gap-3">
			<div className="flex-1">
				<SearchableList
					search={search}
					onSearchChange={setSearch}
					items={scenes}
					renderItem={(scene) => (
						<SceneMenu scene={scene} roomId={roomId} placement="right">
							<SceneMenuButton render={<SceneListCard scene={scene} />} />
						</SceneMenu>
					)}
					actions={
						<ToastActionForm
							message="Creating scene..."
							action={async () => {
								const sceneId = await createScene({ name: "New scene", roomId })
								openSceneEditor(sceneId)
							}}
						>
							<FormButton className={clearButton()}>
								<LucideImagePlus />
								<span className="sr-only">Create scene</span>
							</FormButton>
						</ToastActionForm>
					}
				/>
			</div>

			{selectedScenes.length > 0 && (
				<ActionRow className="flex gap-1 *:flex-1">
					{hasLength(selectedScenes, 1) && (
						<>
							<ActionRowItem
								icon={<LucidePlay />}
								onClick={async () => {
									await updateRoom({
										id: roomId,
										activeSceneId: selectedScenes[0]._id,
									})
									navigate(`?preview=`)
								}}
							>
								Play
							</ActionRowItem>
							<ActionRowItem
								icon={<LucideEye />}
								to={`?preview=${selectedScenes[0]._id}`}
							>
								View
							</ActionRowItem>
							<ActionRowItem
								icon={<LucideEdit />}
								onClick={() => openSceneEditor(selectedScenes[0]._id)}
							>
								Edit
							</ActionRowItem>
						</>
					)}

					<ActionRowItem icon={<LucideX />} onClick={clearSelection}>
						Dismiss
					</ActionRowItem>

					<ToastActionForm
						message="Deleting scene(s)..."
						action={() => {
							return removeScenes({
								sceneIds: selectedScenes.map((scene) => scene._id),
							})
						}}
					>
						<ActionRowItem
							type="submit"
							icon={<LucideTrash />}
							className={errorText()}
						>
							Delete
						</ActionRowItem>
					</ToastActionForm>
				</ActionRow>
			)}

			<Modal open={sceneEditorOpen} setOpen={setSceneEditorOpen}>
				<ModalPanel title="Edit scene">
					{sceneEditorScene ?
						<SceneEditorForm
							scene={sceneEditorScene}
							onSubmitSuccess={() => setSceneEditorOpen(false)}
						/>
					:	<EmptyState title="Scene not found" icon={<LucideImageOff />}>
							This scene has been deleted.
						</EmptyState>
					}
				</ModalPanel>
			</Modal>
		</div>
	)
}
