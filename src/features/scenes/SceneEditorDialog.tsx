import { useMutation } from "convex/react"
import { startTransition, useState, type ComponentProps } from "react"
import { Dialog } from "~/components/Dialog.tsx"
import { api } from "~/convex/_generated/api.js"
import { useDebouncedCallback } from "../../common/react/state.ts"
import { Field } from "../../components/Field.tsx"
import { NumberInput } from "../../components/NumberInput.tsx"
import { Select } from "../../components/Select.tsx"
import { useToastAction } from "../../components/ToastActionForm.tsx"
import { textInput } from "../../styles/input.ts"
import { ImageUploader } from "../images/ImageUploader.tsx"
import { getImageUrl } from "../images/getImageUrl.ts"
import { uploadImage } from "../images/uploadImage.ts"
import { ApiScene } from "./types.ts"

export { Button as SceneEditorDialogButton } from "~/components/Dialog.tsx"

export function SceneEditorDialog({
	children,
	scene,
	...props
}: ComponentProps<typeof Dialog.Root> & {
	scene: ApiScene
}) {
	return (
		<Dialog.Root {...props}>
			{children}

			<Dialog.Content title={scene._id ? "Edit Scene" : "Create Scene"}>
				<SceneEditorForm scene={scene} />
			</Dialog.Content>
		</Dialog.Root>
	)
}

function SceneEditorForm({ scene: sceneProp }: { scene: ApiScene }) {
	const updateScene = useMutation(api.scenes.update)
	const [patch, setPatch] = useState<Partial<ApiScene>>({})
	const scene: ApiScene = { ...sceneProp, ...patch }

	const [, submit] = useToastAction(async (_state: unknown, _payload: void) => {
		await updateScene({ ...patch, sceneId: scene._id })

		// there's a weird stale state issue I can't figure out,
		// but it doesn't matter much anyway, because this view won't have
		// multiple simultaneous editors at the moment
		// but we do want to try to reset the patch later
		// setPatch({})
	})

	const submitDebounced = useDebouncedCallback(() => {
		startTransition(() => {
			submit()
		})
	}, 300)

	const handleChange = (patch: Partial<ApiScene>) => {
		setPatch((current) => ({ ...current, ...patch }))
		submitDebounced()
	}

	return (
		<form className="flex flex-col @container gap">
			<Field label="Name">
				<input
					required
					className={textInput()}
					value={scene.name}
					onChange={(event) => handleChange({ name: event.target.value })}
				/>
			</Field>
			<div className="flex gap @md:grid-flow-col">
				<Select
					className="flex-1"
					label="Mode"
					options={[
						{ name: "Scenery", value: "scenery" },
						{ name: "Battlemap", value: "battlemap" },
					]}
					value={scene.mode}
					onChangeValue={(value) => handleChange({ mode: value })}
				/>
				{scene.mode === "battlemap" && (
					<Field label="Cell size" className="w-24">
						<NumberInput
							required
							className={textInput()}
							value={scene.cellSize}
							onSubmitValue={(value) => handleChange({ cellSize: value })}
						/>
					</Field>
				)}
			</div>
			<Field label="Background">
				{scene.mode === "battlemap" ? (
					<ImageUploader
						imageUrl={
							scene.battlemapBackgroundId &&
							getImageUrl(scene.battlemapBackgroundId)
						}
						onUpload={async ([file]) => {
							const imageId = await uploadImage(file)
							handleChange({ battlemapBackgroundId: imageId })
						}}
					/>
				) : scene.mode === "scenery" ? (
					<ImageUploader
						imageUrl={
							scene.sceneryBackgroundId &&
							getImageUrl(scene.sceneryBackgroundId)
						}
						onUpload={async ([file]) => {
							const imageId = await uploadImage(file)
							handleChange({ sceneryBackgroundId: imageId })
						}}
					/>
				) : null}
			</Field>
		</form>
	)
}
