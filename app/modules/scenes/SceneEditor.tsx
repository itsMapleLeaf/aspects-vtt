import { Link } from "@remix-run/react"
import { useMutation } from "convex/react"
import { LucideDoorOpen, LucideEye } from "lucide-react"
import type React from "react"
import { useEffect } from "react"
import { Button } from "~/ui/Button.tsx"
import { EditableInput } from "~/ui/EditableInput.tsx"
import { EditableIntegerInput } from "~/ui/EditableIntegerInput.tsx"
import { FormField, FormLayout, FormRow } from "~/ui/Form.tsx"
import {
	ModalButton,
	ModalPanel,
	ModalPanelContent,
	ModalProvider,
	type ModalProviderProps,
	useModalContext,
} from "~/ui/Modal.tsx"
import { loadImage } from "../../../common/dom/images.ts"
import type { Overwrite } from "../../../common/types.ts"
import { api } from "../../../convex/_generated/api"
import { ImageUploader } from "../api-images/ImageUploader.tsx"
import { useMutationAction } from "../convex/hooks.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import type { ApiScene } from "./types.ts"

export function SceneEditor({ scene }: { scene: ApiScene }) {
	const room = useRoom()
	const updateScene = useMutation(api.scenes.functions.update)
	const [updateRoomState, updateRoom] = useMutationAction(
		api.rooms.functions.update,
	)
	const isCurrent = room.currentScene === scene._id
	const modal = useModalContext()

	useEffect(() => {
		if (updateRoomState.type === "success") {
			modal?.hide()
		}
	}, [modal, updateRoomState.type])

	return (
		<FormLayout>
			<FormRow>
				<FormField label="Scene name" className="flex-1">
					<EditableInput
						value={scene.name}
						onSubmit={(value) => updateScene({ id: scene._id, name: value })}
					/>
				</FormField>
				<FormField label="Cell size" className="w-24">
					<EditableIntegerInput
						align="center"
						value={scene.cellSize}
						onSubmit={(value) =>
							updateScene({ id: scene._id, cellSize: value })
						}
					/>
				</FormField>
			</FormRow>

			<ImageUploader
				imageId={scene.background}
				onUpload={async (imageId, file) => {
					const { width, height } = await loadImage(URL.createObjectURL(file))
					updateScene({
						id: scene._id,
						background: imageId,
						backgroundDimensions: { x: width, y: height },
					})
				}}
				onRemove={async () => {
					updateScene({ id: scene._id, background: null })
				}}
			/>

			<FormRow className="*:flex-1">
				<Button
					icon={<LucideEye />}
					element={
						<Link to={`?scene=${scene._id}`} onClick={() => modal?.hide()} />
					}
				>
					View scene
				</Button>
				{isCurrent ? null : (
					<Button
						icon={<LucideDoorOpen />}
						onClick={() => {
							updateRoom({ id: scene.roomId, currentScene: scene._id })
						}}
					>
						Set as current scene
					</Button>
				)}
			</FormRow>
		</FormLayout>
	)
}
export function SceneEditorModal({
	scene,
	children,
	...props
}: { scene: ApiScene } & Overwrite<
	ModalProviderProps,
	{ children: React.ReactNode }
>) {
	return (
		<ModalProvider {...props}>
			{children}
			<ModalPanel title={`Editing ${scene.name}`}>
				<ModalPanelContent>
					<SceneEditor scene={scene} />
				</ModalPanelContent>
			</ModalPanel>
		</ModalProvider>
	)
}
SceneEditorModal.Button = ModalButton
