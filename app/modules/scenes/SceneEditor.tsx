import { Link, useNavigate } from "@remix-run/react"
import { useMutation } from "convex/react"
import { LucideDoorOpen, LucideEye } from "lucide-react"
import type React from "react"
import { useEffect } from "react"
import { Button } from "~/ui/Button.tsx"
import { CheckboxField } from "~/ui/CheckboxField.tsx"
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
	const navigate = useNavigate()

	const updateScene = useMutation(
		api.scenes.functions.update,
	).withOptimisticUpdate((store, args) => {
		const existing = store.getQuery(api.scenes.functions.get, { id: scene._id })
		if (existing) {
			store.setQuery(
				api.scenes.functions.get,
				{ id: scene._id },
				{
					...existing,
					...args,
				},
			)
		}

		for (const listQuery of store.getAllQueries(api.scenes.functions.list)) {
			if (listQuery.value) {
				store.setQuery(
					api.scenes.functions.list,
					listQuery.args,
					listQuery.value.map((it) =>
						it._id === scene._id ? { ...it, ...args } : it,
					),
				)
			}
		}
	})

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

			<FormRow>
				<CheckboxField
					label="Use token grid"
					description="Disable this if the background is a scenery image instead of an overhead map."
					checked={scene.tokensVisible ?? false}
					onChange={(event) =>
						updateScene({
							id: scene._id,
							tokensVisible: event.target.checked,
						})
					}
				/>
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

							const newParams = new URLSearchParams(window.location.search)
							newParams.delete("scene")
							navigate(`?${newParams.toString()}`)
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
