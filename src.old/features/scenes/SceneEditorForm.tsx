import { Focusable } from "@ariakit/react"
import { useMutation } from "convex/react"
import { LucideGrid2x2, LucideImage, LucideSave } from "lucide-react"
import { useState } from "react"
import * as v from "valibot"
import { api } from "../../../convex/_generated/api.js"
import { formDataSchema, formNumberSchema } from "../../lib/validation.ts"
import { FormField } from "../../ui/form.tsx"
import { FormButton } from "../../ui/FormButton.tsx"
import { InputField } from "../../ui/input.tsx"
import { Select, SelectOption } from "../../ui/Select.tsx"
import { formLayout, solidButton } from "../../ui/styles.ts"
import { ToastActionForm } from "../../ui/toast.tsx"
import { ImageDropzone } from "../images/ImageDropzone.tsx"
import { uploadImage } from "../images/uploadImage.ts"
import { ApiScene } from "./types.ts"

export function SceneEditorForm({
	scene,
	onSubmitSuccess,
}: {
	scene: ApiScene
	onSubmitSuccess?: (scene: ApiScene) => void
}) {
	const updateScene = useMutation(api.functions.scenes.update)

	type Mode = ApiScene["mode"]

	const modeOptions: SelectOption<Mode>[] = [
		{
			value: "scenery",
			label: "Scenery",
			icon: <LucideImage />,
		},
		{
			value: "battlemap",
			label: "Battlemap",
			icon: <LucideGrid2x2 />,
		},
	]

	const [mode, setMode] = useState(scene.mode)

	return (
		<ToastActionForm
			message="Saving scene..."
			action={async (formData) => {
				const schema = v.pipe(
					formDataSchema(),
					v.object({
						name: v.optional(v.pipe(v.string(), v.maxLength(255))),
						dayBackground: v.optional(v.file()),
						eveningBackground: v.optional(v.file()),
						nightBackground: v.optional(v.file()),
						mode: v.union([v.literal("battlemap"), v.literal("scenery")]),
						cellSize: v.optional(
							v.pipe(formNumberSchema(), v.integer(), v.minValue(1)),
						),
					}),
				)

				const data = v.parse(schema, formData)

				const [dayBackgroundId, eveningBackgroundId, nightBackgroundId] =
					await Promise.all([
						data.dayBackground && uploadImage(data.dayBackground),
						data.eveningBackground && uploadImage(data.eveningBackground),
						data.nightBackground && uploadImage(data.nightBackground),
					])

				await updateScene({
					id: scene._id,
					name: data.name,
					mode: data.mode,
					cellSize: data.mode === "battlemap" ? data.cellSize : undefined,
					dayBackgroundId,
					eveningBackgroundId,
					nightBackgroundId,
				})
				onSubmitSuccess?.(scene)
			}}
			className={formLayout()}
			key={scene._id}
		>
			<Focusable
				autoFocus
				render={
					<InputField
						label="Name"
						name="name"
						defaultValue={scene.name}
						required
					/>
				}
			/>

			<Select
				name="mode"
				label="Scene mode"
				defaultValue={scene.mode}
				onValueChange={setMode}
				options={modeOptions}
			/>

			{mode === "battlemap" && (
				<InputField
					label="Cell size"
					name="cellSize"
					defaultValue={scene.cellSize}
					required
				/>
			)}

			<fieldset className="grid auto-cols-fr grid-flow-col gap-2">
				<FormField label="Day background">
					<ImageDropzone
						name="dayBackground"
						defaultImageUrl={scene.dayBackgroundUrl}
					/>
				</FormField>
				<FormField label="Evening background">
					<ImageDropzone
						name="eveningBackground"
						defaultImageUrl={scene.eveningBackgroundUrl}
					/>
				</FormField>
				<FormField label="Night background">
					<ImageDropzone
						name="nightBackground"
						defaultImageUrl={scene.nightBackgroundUrl}
					/>
				</FormField>
			</fieldset>

			<FormButton className={solidButton()}>
				<LucideSave /> Save
			</FormButton>
		</ToastActionForm>
	)
}
