import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { api } from "../../../convex/_generated/api.js"
import { ResourceGroup, ResourceTreeItem } from "../resources/ResourceTree.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { SceneEditorModal } from "./SceneEditor.tsx"

export function SceneResourceGroup() {
	const room = useRoom()
	const scenes = useQuery(api.scenes.functions.list, { roomId: room._id })
	const createScene = useMutation(api.scenes.functions.create)
	const deleteScene = useMutation(api.scenes.functions.remove)

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
			renderItem={(scene) => (
				<SceneEditorModal scene={scene}>
					<SceneEditorModal.Button
						render={
							<ResourceTreeItem
								key={scene._id}
								resourceId={scene._id}
								resourceName={scene.name}
								resourceType="scene"
								icon={<Lucide.Image />}
								delete={async () => {
									await deleteScene({ id: scene._id })
								}}
							>
								{scene.name}
							</ResourceTreeItem>
						}
					/>
				</SceneEditorModal>
			)}
		/>
	)
}
