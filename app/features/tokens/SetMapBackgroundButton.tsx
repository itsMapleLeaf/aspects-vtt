import { useConvex, useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useRef } from "react"
import { api } from "../../../convex/_generated/api.js"
import type { Doc } from "../../../convex/_generated/dataModel.js"
import { loadImage } from "../../common/dom.ts"
import { expect } from "../../common/expect.ts"
import { useAsyncState } from "../../common/useAsyncState.ts"
import { Button } from "../../ui/Button.tsx"
import { uploadImage } from "../images/uploadImage.ts"

export function SetMapBackgroundButton({ scene }: { scene: Doc<"scenes"> }) {
	const updateScene = useMutation(api.scenes.functions.update)
	const inputRef = useRef<HTMLInputElement>(null)
	const convex = useConvex()

	const [state, updateSceneBackground] = useAsyncState(
		async function updateSceneBackground(file: File) {
			try {
				const image = await loadImage(URL.createObjectURL(file))
				const imageId = await uploadImage(file, convex)
				await updateScene({
					id: scene._id,
					background: imageId,
					backgroundDimensions: {
						x: image.width,
						y: image.height,
					},
				})
			} catch (error) {
				console.error(error)
				alert("Failed to upload image")
			}
		},
	)

	return (
		<>
			<Button
				icon={<Lucide.ImagePlus />}
				text="Set Background"
				className="w-full"
				pending={state.status === "pending"}
				onClick={() => {
					const input = expect(inputRef.current, "input ref not set")
					input.click()
				}}
				onDragOver={(event) => {
					event.preventDefault()
					event.dataTransfer.dropEffect = "move"
				}}
				onDrop={async (event) => {
					event.preventDefault()
					const file = expect(event.dataTransfer.files[0], "file not set")
					await updateSceneBackground(file)
				}}
			/>
			<input
				type="file"
				accept="image/png,image/jpeg,image/gif,image/webp"
				ref={inputRef}
				className="hidden"
				onInput={(event) => {
					const file = event.currentTarget.files?.[0]
					event.currentTarget.value = ""
					if (file) {
						updateSceneBackground(file)
					}
				}}
			/>
		</>
	)
}
