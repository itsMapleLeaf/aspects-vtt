import { useMutation } from "convex/react"
import {
	LucideCopy,
	LucideEdit,
	LucideEye,
	LucidePlay,
	LucideTrash,
} from "lucide-react"
import { ComponentProps } from "react"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel"
import {
	Menu,
	MenuButton,
	MenuFormItem,
	MenuItem,
	MenuPanel,
} from "../../ui/menu.tsx"
import { Modal, ModalButton, ModalPanel } from "../../ui/modal.tsx"
import { useRoomParams } from "../rooms/params.ts"
import { SceneEditorForm } from "./SceneEditorForm.tsx"
import { ApiScene } from "./types.ts"

export function SceneMenu({
	scene,
	roomId,
	children,
	...props
}: ComponentProps<typeof Menu> & {
	scene: ApiScene
	roomId: Id<"rooms">
}) {
	const updateRoom = useMutation(api.rooms.update)
	const duplicateScene = useMutation(api.scenes.duplicate)
	const deleteScene = useMutation(api.scenes.remove)
	const { setPreviewSceneId } = useRoomParams()
	return (
		<Menu {...props}>
			{children}
			<MenuPanel>
				<MenuFormItem
					message="Moving to scene..."
					action={() => updateRoom({ id: roomId, activeSceneId: scene._id })}
				>
					<LucidePlay />
					Play
				</MenuFormItem>

				<MenuFormItem
					message="Previewing scene..."
					action={async () => setPreviewSceneId(scene._id)}
				>
					<LucideEye />
					Preview
				</MenuFormItem>

				<Modal>
					<ModalButton render={<MenuItem />}>
						<LucideEdit />
						Edit
					</ModalButton>
					<ModalPanel title="Edit scene">
						<SceneEditorForm scene={scene} />
					</ModalPanel>
				</Modal>

				<MenuFormItem
					message="Duplicating scene..."
					action={() => duplicateScene({ sceneIds: [scene._id] })}
				>
					<LucideCopy />
					Duplicate
				</MenuFormItem>

				<MenuFormItem
					message="Deleting scene..."
					action={() => deleteScene({ sceneIds: [scene._id] })}
				>
					<LucideTrash />
					Delete
				</MenuFormItem>
			</MenuPanel>
		</Menu>
	)
}

export const SceneMenuButton = MenuButton
