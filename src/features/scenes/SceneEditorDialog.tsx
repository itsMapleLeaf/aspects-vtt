import { useMutation } from "convex/react"
import type { ComponentProps } from "react"
import * as v from "valibot"
import { nonEmptyShortText } from "~/common/validators.ts"
import { Dialog } from "~/components/Dialog.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { EditorFormLayout } from "~/features/forms/EditorFormLayout.tsx"
import { FileField, InputField, SelectField } from "~/features/forms/fields.tsx"
import { useForm, valibotAction } from "~/features/forms/useForm.ts"
import { uploadImage } from "../images/uploadImage.ts"
import { useRoomContext } from "../rooms/context.tsx"

export { Button as SceneEditorDialogButton } from "~/components/Dialog.tsx"

// Define EditorScene type within this file
export interface EditorScene {
	_id?: Id<"scenes">
	name: string
	mode: "scenery" | "battlemap"
	backgroundId?: Id<"_storage">
}

export function SceneEditorDialog({
	children,
	scene,
	onSubmitSuccess,
	...props
}: ComponentProps<typeof Dialog.Root> & {
	scene: EditorScene
	onSubmitSuccess: () => void
}) {
	return (
		<Dialog.Root {...props}>
			{children}

			<Dialog.Content
				title={scene._id ? "Edit Scene" : "Create Scene"}
				className="h-[400px]"
			>
				<SceneEditorForm scene={scene} onSubmitSuccess={onSubmitSuccess} />
			</Dialog.Content>
		</Dialog.Root>
	)
}

function SceneEditorForm({
	scene,
	onSubmitSuccess,
}: {
	scene: EditorScene
	onSubmitSuccess: () => void
}) {
	const room = useRoomContext()
	const createScene = useMutation(api.scenes.create)
	const updateScene = useMutation(api.scenes.update)

	const form = useForm({
		initialValues: {
			name: scene.name,
			mode: scene.mode,
			background: null as File | null,
		},
		pendingMessage: "Saving scene...",
		successMessage: "Scene saved successfully",
		action: valibotAction(
			v.object({
				name: nonEmptyShortText,
				mode: v.union([v.literal("scenery"), v.literal("battlemap")]),
				background: v.optional(v.instance(File)),
			}),
			async ({ background, ...input }) => {
				let backgroundId
				if (background) {
					backgroundId = await uploadImage(background)
				}

				if (scene._id == null) {
					await createScene({
						roomId: room._id,
						...input,
						backgroundIds: backgroundId ? [backgroundId] : [],
					})
				} else {
					await updateScene({
						sceneId: scene._id,
						...input,
						battlemapBackgroundId: backgroundId,
					})
				}
				onSubmitSuccess()
			},
		),
	})

	return (
		<EditorFormLayout form={form}>
			<InputField label="Name" field={form.fields.name} required />
			<SelectField
				label="Mode"
				field={form.fields.mode}
				options={[
					{ name: "Scenery", value: "scenery" },
					{ name: "Battlemap", value: "battlemap" },
				]}
			/>
			<FileField
				label="Background"
				field={form.fields.background}
				accept="image/*"
			/>
		</EditorFormLayout>
	)
}
