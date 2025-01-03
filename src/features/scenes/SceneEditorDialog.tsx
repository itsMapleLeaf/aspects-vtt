import { useMutation } from "convex/react"
import { type ComponentProps } from "react"
import { Dialog } from "~/components/Dialog.tsx"
import { api } from "~/convex/_generated/api.js"
import { Field } from "../../components/Field.tsx"
import { NumberInput } from "../../components/NumberInput.tsx"
import { Select } from "../../components/Select.tsx"
import { usePatchUpdate } from "../../hooks/usePatchUpdate.ts"
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

	const { patched: scene, update: handleChange } = usePatchUpdate(
		sceneProp,
		(patch) => updateScene({ ...patch, sceneId: sceneProp._id }),
	)

	return (
		<form className="gap @container flex flex-col">
			<Field label="Name">
				<input
					required
					className={textInput()}
					value={scene.name}
					onChange={(event) => handleChange({ name: event.target.value })}
				/>
			</Field>
			<div className="gap flex @md:grid-flow-col">
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
