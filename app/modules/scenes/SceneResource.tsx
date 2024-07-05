import { useMutation } from "convex/react"
import { LucideDoorOpen, LucideImage, LucideImagePlay } from "lucide-react"
import React, { useEffect, useState } from "react"
import { z } from "zod"
import { loadImage } from "~/helpers/dom/images.ts"
import type { Overwrite } from "~/helpers/types.ts"
import { defineResource, type Resource } from "~/modules/resources/Resource"
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
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { ImageUploader } from "../api-images/ImageUploader.tsx"
import { useMutationAction } from "../convex/hooks.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import type { ApiScene } from "./types.ts"

export interface SceneResource extends Resource {
	readonly dragData: { sceneId: Id<"scenes"> }
}

export const SceneResource = defineResource({
	name: "SceneResource",

	dragDataSchema: z.object({
		sceneId: z.custom<Id<"scenes">>((input) => typeof input === "string"),
	}),

	create: (scene: ApiScene) => ({
		id: scene._id,
		name: scene.name,
		dragData: { sceneId: scene._id },
	}),

	TreeItem: ({ scene }: { scene: ApiScene }) => <SceneTreeElement scene={scene} />,
})

function SceneTreeElement({ scene }: { scene: ApiScene }) {
	const room = useRoom()
	const isCurrent = room.currentScene === scene._id
	const [open, setOpen] = useState(false)

	return (
		<SceneEditorModal open={open} setOpen={setOpen} scene={scene}>
			<SceneEditorModal.Button
				render={
					<Button
						text={scene.name}
						icon={isCurrent ? <LucideImagePlay /> : <LucideImage />}
						appearance="clear"
						active={isCurrent}
						className="w-full justify-start"
					/>
				}
			/>
		</SceneEditorModal>
	)
}

function SceneEditorModal({
	scene,
	children,
	...props
}: { scene: ApiScene } & Overwrite<ModalProviderProps, { children: React.ReactNode }>) {
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

function SceneEditor({ scene }: { scene: ApiScene }) {
	const room = useRoom()
	const updateScene = useMutation(api.scenes.functions.update)
	const [updateRoomState, updateRoom] = useMutationAction(api.rooms.functions.update)
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
						onSubmit={(value) => updateScene({ id: scene._id, cellSize: value })}
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

			{isCurrent ? null : (
				<Button
					text="Visit scene"
					icon={<LucideDoorOpen />}
					onClick={() => {
						updateRoom({ id: scene.roomId, currentScene: scene._id })
					}}
					className="w-full"
				/>
			)}
		</FormLayout>
	)
}
