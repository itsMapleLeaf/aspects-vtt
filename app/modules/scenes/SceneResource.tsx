import { useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import { LucideCheck, LucideImage, LucideImagePlay } from "lucide-react"
import { useActionState, useState } from "react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { ResourceClass, type Resource } from "~/modules/resources/Resource"
import { SetMapBackgroundButton } from "~/modules/tokens/SetMapBackgroundButton.tsx"
import { Button } from "~/ui/Button.tsx"
import { FormField, FormLayout, FormRow } from "~/ui/Form.tsx"
import { Input } from "~/ui/Input.tsx"
import { Menu } from "~/ui/Menu.tsx"
import { Modal } from "~/ui/Modal.tsx"
import { useToaster } from "~/ui/Toaster.tsx"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { useRoom } from "../rooms/roomContext.tsx"
import type { ApiScene } from "./types.ts"

export interface SceneResource extends Resource {
	readonly dragData: { sceneId: Id<"scenes"> }
}

export const SceneResource = new (class extends ResourceClass<SceneResource> {
	readonly dragDataSchema = z.object({
		sceneId: z.custom<Id<"scenes">>((input) => typeof input === "string"),
	})

	create(scene: ApiScene): SceneResource {
		return {
			id: scene._id,
			name: scene.name,
			dragData: { sceneId: scene._id },
			renderTreeElement: () => <SceneTreeElement scene={scene} />,
		}
	}
})()

function SceneTreeElement({ scene }: { scene: ApiScene }) {
	const room = useRoom()
	const updateScene = useMutation(api.scenes.functions.update)
	const updateRoom = useMutation(api.rooms.functions.update)
	const toast = useToaster()

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

	const [open, setOpen] = useState(false)

	const isCurrent = room.currentScene === scene._id

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
				<form className="contents" action={action}>
					<FormLayout>
						{state.errors?.formErrors &&
							[...new Set(state.errors.formErrors)].map((error) => (
								<p key={error} className="text-red-500">
									{error}
								</p>
							))}

						<FormField label="Scene name">
							<Input defaultValue={scene.name} />
							{state.errors?.fieldErrors.name && (
								<p className="text-red-500">{state.errors.fieldErrors.name}</p>
							)}
						</FormField>

						<FormRow className="items-end">
							<FormField label="Cell size" className="w-1/2 min-w-24">
								<Input align="center" value={scene.cellSize} required pattern="\d+" />
								{state.errors?.fieldErrors.cellSize && (
									<p className="text-red-500">{state.errors.fieldErrors.cellSize}</p>
								)}
							</FormField>
							<div className="flex-1">
								<SetMapBackgroundButton scene={scene} />
							</div>
						</FormRow>

						{isCurrent ? null : (
							<FormRow>
								<Button
									text="Set as current scene"
									icon={<LucideCheck />}
									onClick={async () => {
										await updateRoom({ id: scene.roomId, currentScene: scene._id })
										setOpen(false)
									}}
									className="w-full"
								/>
							</FormRow>
						)}
					</FormLayout>
				</form>
			</Modal>
		</Menu>
	)
}
