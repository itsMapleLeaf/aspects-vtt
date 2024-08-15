import { useNavigate } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { api } from "../../../convex/_generated/api.js"
import { ResourceGroup, ResourceTreeItem } from "../resources/ResourceTree.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { useUpdateRoomMutation } from "../rooms/useUpdateRoomMutation.tsx"
import { SceneEditorModal } from "./SceneEditor.tsx"
import { useSceneParam } from "./hooks.ts"
import type { ApiScene } from "./types.ts"

export function SceneResourceGroup() {
	const room = useRoom()
	const scenes = useQuery(api.scenes.functions.list, { roomId: room._id })
	const createScene = useMutation(api.scenes.functions.create)

	return (
		<ResourceGroup
			id="scenes"
			name="Scenes"
			add={{
				label: "Add scene",
				icon: <Lucide.ImagePlus />,
				action: async () => {
					await createScene({ roomId: room._id, name: "New Scene" })
				},
			}}
			items={(scenes ?? []).map((scene) => ({
				id: scene._id,
				name: scene.name,
				timestamp: scene._creationTime,
				data: scene,
			}))}
			renderItem={(scene) => <SceneResourceTreeItem scene={scene} />}
		/>
	)
}

function SceneResourceTreeItem({ scene }: { scene: ApiScene }) {
	const room = useRoom()
	const deleteScene = useMutation(api.scenes.functions.remove)
	const sceneParam = useSceneParam()
	const [editorOpen, setEditorOpen] = useState(false)
	const updateRoom = useUpdateRoomMutation()
	const duplicateScene = useMutation(api.scenes.functions.duplicate)
	const navigate = useNavigate()

	return (
		<>
			<ResourceTreeItem
				key={scene._id}
				resourceId={scene._id}
				resourceName={scene.name}
				resourceType="scene"
				icon={
					room.currentScene === scene._id ? <Lucide.ImagePlay />
					: scene._id === sceneParam ?
						<Lucide.LucidePencilRuler />
					:	<Lucide.Image />
				}
				active={room.currentScene === scene._id}
				delete={async () => {
					await deleteScene({ id: scene._id })
				}}
				onClick={() => {
					setEditorOpen(true)
				}}
				additionalActions={[
					{
						text: "Set as current scene",
						icon: <Lucide.ImagePlay />,
						onClick: () => {
							updateRoom({
								id: room._id,
								currentScene: scene._id,
							})
							navigate(`?scene=`)
						},
					},
					{
						text: "View",
						icon: <Lucide.Eye />,
						onClick: () => {
							navigate(`?scene=${scene._id}`)
						},
					},
					{
						text: "Edit",
						icon: <Lucide.Pencil />,
						onClick: () => {
							setEditorOpen(true)
						},
					},
					{
						text: "Duplicate",
						icon: <Lucide.Copy />,
						onClick: () => {
							duplicateScene({ id: scene._id })
						},
					},
				]}
			>
				{scene.name}
			</ResourceTreeItem>
			<SceneEditorModal
				scene={scene}
				open={editorOpen}
				setOpen={setEditorOpen}
			/>
		</>
	)
}
