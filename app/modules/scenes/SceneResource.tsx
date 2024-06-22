import { useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import { LucideCheck, LucideImage, LucideImagePlay, LucideImagePlus } from "lucide-react"
import { useActionState, useState } from "react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { loadImage } from "~/helpers/dom/images.ts"
import { ResourceClass, type Resource } from "~/modules/resources/Resource"
import { Button } from "~/ui/Button.tsx"
import { FormErrors, FormField, FormLayout, FormRow } from "~/ui/Form.tsx"
import { Input } from "~/ui/Input.tsx"
import { Menu, MenuItem } from "~/ui/Menu.tsx"
import { Modal, useModalContext } from "~/ui/Modal.tsx"
import { useToaster } from "~/ui/Toaster.tsx"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { ImageUploader } from "../api-images/ImageUploader.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import type { ApiScene } from "./types.ts"

export interface SceneResource extends Resource {
	readonly dragData: { sceneId: Id<"scenes"> }
}

class SceneResourceClass extends ResourceClass<SceneResource> {
	readonly dragDataSchema = z.object({
		sceneId: z.custom<Id<"scenes">>((input) => typeof input === "string"),
	})

	create(scene: ApiScene): SceneResource {
		return {
			id: scene._id,
			name: scene.name,
			dragData: { sceneId: scene._id },
			TreeItemElement: () => <SceneTreeElement scene={scene} />,
		}
	}

	CreateMenuItem = () => {
		return <MenuItem icon={<LucideImagePlus />} text="Scene" />
	}
}
export const SceneResource = new SceneResourceClass()

function SceneTreeElement({ scene }: { scene: ApiScene }) {
	const room = useRoom()
	const isCurrent = room.currentScene === scene._id
	const [open, setOpen] = useState(false)

	return (
		<Menu>
			<Modal
				text={scene.name}
				icon={isCurrent ? <LucideImagePlay /> : <LucideImage />}
				appearance="clear"
				className={twMerge(
					"w-full justify-start",
					isCurrent && "text-primary-800 text-opacity-100",
				)}
				title={`Editing ${scene.name}`}
				open={open}
				onOpenChange={setOpen}
			>
				<SceneEditor scene={scene} />
			</Modal>
		</Menu>
	)
}

function SceneEditor({ scene }: { scene: ApiScene }) {
	const room = useRoom()
	const updateScene = useMutation(api.scenes.functions.update)
	const updateRoom = useMutation(api.rooms.functions.update)
	const toast = useToaster()
	const isCurrent = room.currentScene === scene._id
	const modal = useModalContext()

	const [state, action] = useActionState(async (_: unknown, formData: FormData) => {
		const schema = z.object({
			name: z.string().min(1).max(100),
			cellSize: z.coerce.number().int().min(20).max(100),
		})

		const result = schema.safeParse(Object.fromEntries(formData))
		if (!result.success) {
			return { errors: result.error.formErrors }
		}

		try {
			await updateScene({
				id: scene._id,
				name: result.data.name,
				cellSize: result.data.cellSize,
			})
		} catch (error) {
			toast.error({
				title: "Something went wrong :(",
				body: error instanceof ConvexError ? error.message : undefined,
			})
		}

		return {}
	}, {})

	return (
		<form className="contents" action={action}>
			<FormLayout>
				<FormErrors errors={state.errors?.formErrors} />

				<FormRow>
					<FormField label="Scene name" className="flex-1">
						<Input defaultValue={scene.name} />
						<FormErrors errors={state.errors?.fieldErrors.name} />
					</FormField>
					<FormField label="Cell size" className="w-24">
						<Input align="center" value={scene.cellSize} required pattern="\d+" />
						<FormErrors errors={state.errors?.fieldErrors.cellSize} />
					</FormField>
				</FormRow>

				<ImageUploader
					imageId={scene.background}
					onUpload={async (imageId, file) => {
						const { width, height } = await loadImage(URL.createObjectURL(file))
						await updateScene({
							id: scene._id,
							background: imageId,
							backgroundDimensions: { x: width, y: height },
						})
					}}
					onRemove={async () => {
						await updateScene({ id: scene._id, background: null })
					}}
				/>

				{isCurrent ? null : (
					<Button
						text="Set as current scene"
						icon={<LucideCheck />}
						onClick={async () => {
							await updateRoom({ id: scene.roomId, currentScene: scene._id })
							modal?.hide()
						}}
						className="w-full"
					/>
				)}
			</FormLayout>
		</form>
	)
}
