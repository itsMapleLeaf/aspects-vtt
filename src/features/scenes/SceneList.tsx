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
import { setToggle } from "../../lib/set.ts"
import { typed } from "../../lib/types.ts"
import { ActionRow, ActionRowItem } from "../../ui/ActionRow.tsx"
import { EmptyState } from "../../ui/empty-state.tsx"
import { FormButton } from "../../ui/FormButton.tsx"
import { Modal, ModalPanel } from "../../ui/modal.tsx"
import { PressEvent } from "../../ui/Pressable.tsx"
import { SearchableList } from "../../ui/SearchableList.tsx"
import { Selectable } from "../../ui/Selectable.tsx"
import { clearButton, errorText } from "../../ui/styles.ts"
import { ToastActionForm } from "../../ui/toast.tsx"
import { SceneEditorForm } from "./SceneEditorForm"
import { SceneListCard } from "./SceneListCard"
import { ApiScene } from "./types.ts"

export function SceneList({ roomId }: { roomId: Id<"rooms"> }) {
	const navigate = useNavigate()

	const [state, setState] = useState({
		search: "",
		selectedSceneIds: typed<ReadonlySet<Id<"scenes">>>(new Set<Id<"scenes">>()),
		lastSelectedSceneId: typed<Id<"scenes"> | null>(null),
		sceneEditorOpen: false,
		sceneEditorSceneId: typed<Id<"scenes"> | null>(null),
	})

	const scenes =
		useStableQuery(api.functions.scenes.list, {
			roomId,
			search: state.search,
		}) ?? EMPTY_ARRAY

	const createScene = useMutation(api.functions.scenes.create)
	const removeScenes = useMutation(api.functions.scenes.remove)
	const updateRoom = useMutation(api.functions.rooms.update)

	const sceneEditorScene = scenes.find(
		(scene) => scene._id === state.sceneEditorSceneId,
	)

	const selectedScenes = scenes.filter((scene) =>
		state.selectedSceneIds.has(scene._id),
	)

	const setSearch = (search: string) => {
		setState((current) => ({ ...current, search }))
	}

	const openSceneEditor = (scene: ApiScene) => {
		setState((current) => ({
			...current,
			sceneEditorOpen: true,
			sceneEditorSceneId: scene._id,
		}))
	}

	const setSceneEditorOpen = (open: boolean) => {
		setState((current) => ({ ...current, sceneEditorOpen: open }))
	}

	const clearSelection = () => {
		setState((current) => ({
			...current,
			selectedSceneIds: new Set<Id<"scenes">>(),
		}))
	}

	const handleScenePress = (scene: ApiScene, event: PressEvent) => {
		// ctrl should toggle the scene
		if (event.ctrlKey) {
			setState((current) => ({
				...current,
				selectedSceneIds: setToggle(current.selectedSceneIds, scene._id),
			}))
			return
		}

		// shift should do a range select from the last selected scene to the current one
		if (event.shiftKey) {
			const lastSelectedIndex = scenes.findIndex(
				(scene) => scene._id === state.lastSelectedSceneId,
			)
			const selectedIndex = scenes.findIndex((scene) => scene._id === scene._id)
			setState((current) => ({
				...current,
				selectedSceneIds: new Set(
					scenes
						.slice(
							Math.min(lastSelectedIndex, selectedIndex),
							Math.max(lastSelectedIndex, selectedIndex) + 1,
						)
						.map((scene) => scene._id),
				),
			}))
			return
		}

		// if selected, open the editor
		if (state.selectedSceneIds.has(scene._id)) {
			// this startTransition makes autoFocus work in the editor, for some reason
			openSceneEditor(scene)
			return
		}

		// otherwise, set the current scene as the only selected one
		setState((current) => ({
			...current,
			selectedSceneIds: new Set([scene._id]),
			lastSelectedSceneId: scene._id,
		}))
	}

	return (
		<div className="relative flex h-full flex-col gap-3">
			<div className="flex-1">
				<SearchableList
					search={state.search}
					onSearchChange={setSearch}
					items={scenes}
					renderItem={(scene) => (
						<Selectable
							active={state.selectedSceneIds.has(scene._id)}
							onPress={(event) => handleScenePress(scene, event)}
						>
							<SceneListCard scene={scene} />
						</Selectable>
					)}
					actions={
						<ToastActionForm
							message="Creating scene..."
							action={async () => {
								const scene = await createScene({ name: "New scene", roomId })
								openSceneEditor(scene)
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
								onClick={() => openSceneEditor(selectedScenes[0])}
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
								ids: selectedScenes.map((scene) => scene._id),
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

			<Modal open={state.sceneEditorOpen} setOpen={setSceneEditorOpen}>
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
