import { useMutation, useQuery } from "convex/react"
import { FunctionReturnType } from "convex/server"
import { LucideImageOff, LucideImagePlus } from "lucide-react"
import { useDropzone } from "react-dropzone"
import * as v from "valibot"
import { api } from "../../convex/_generated/api.js"
import { Id } from "../../convex/_generated/dataModel"
import { SearchableList } from "../ui/SearchableList.tsx"
import { clearButton, heading2xl, panel } from "../ui/styles.ts"

const mockScenes = [
	{
		_id: "1",
		name: "Rosenfeld",
		background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "2",
		name: "Whisperwood Forest",
		background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "3",
		name: "Azeurus",
		background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "4",
		name: "The Caldera",
		// background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "5",
		name: "Aeropolis",
		background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "6",
		name: "The Undergrowth",
		// background: "https://placehold.co/800x450.webp",
	},
]

export function SceneList({ roomId }: { roomId: Id<"rooms"> }) {
	const scenes = useQuery(api.functions.scenes.list, { room: roomId })
	const createScene = useMutation(api.functions.scenes.create)
	const createUploadUrl = useMutation(api.functions.storage.createUploadUrl)

	const dropzone = useDropzone({
		accept: {
			"image/png": [],
			"image/jpeg": [],
			"image/webp": [],
		},
		multiple: true,
		noClick: true,
		onDrop: async (files) => {
			try {
				const url = await createUploadUrl()

				const storageIds = await Promise.all(
					files.map(async (file) => {
						try {
							const response = await fetch(url, {
								method: "POST",
								body: file,
								headers: { "Content-Type": file.type },
							})
							const data = v.parse(
								v.object({ storageId: v.string() }),
								await response.json(),
							)
							return data.storageId
						} catch (error) {
							console.error("Upload failed", error, file)
						}
					}),
				)

				await createScene({
					name: files[0]!.name,
					roomId,
					backgroundIds: storageIds.filter(Boolean),
				})
			} catch (error) {
				alert("Something went wrong. Try again.")
				console.error(error)
			}
		},
	})

	return (
		<div {...dropzone.getRootProps()} className="relative h-full">
			<input {...dropzone.getInputProps()} />
			<SearchableList
				items={scenes ?? []}
				renderItem={(scene) => <SceneCard scene={scene} />}
				searchKeys={["name"]}
				actions={
					<button
						type="button"
						className={clearButton()}
						onClick={() => dropzone.open()}
					>
						<LucideImagePlus />
						<span className="sr-only">Create scene</span>
					</button>
				}
			/>
			<div
				data-active={dropzone.isDragActive || undefined}
				className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-md bg-primary-900 opacity-0 transition data-[active]:opacity-50"
			>
				<LucideImagePlus className="size-24" />
				<p
					className={heading2xl("max-w-[75%] text-balance text-center text-lg")}
				>
					Drop images here to create a scene
				</p>
			</div>
		</div>
	)
}

function SceneCard({
	scene,
}: {
	scene: FunctionReturnType<typeof api.functions.scenes.list>[number]
}) {
	return (
		<div
			className={panel(
				"group relative grid h-20 cursor-default cursor-zoom-in place-content-center overflow-clip",
			)}
		>
			{scene.activeBackgroundUrl ? (
				<img
					src={scene.activeBackgroundUrl}
					alt=""
					className="absolute inset-0 size-full object-cover blur-sm brightness-[35%] transition group-hover:blur-0"
				/>
			) : (
				<div className="absolute inset-0 grid place-content-center">
					<LucideImageOff className="size-24" />
				</div>
			)}
			<p
				className={heading2xl(
					"relative line-clamp-2 text-balance text-center text-xl",
				)}
			>
				{scene.name}
			</p>
		</div>
	)
}
