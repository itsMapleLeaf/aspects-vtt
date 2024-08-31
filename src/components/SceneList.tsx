import * as Ariakit from "@ariakit/react"
import { useMutation, useQuery } from "convex/react"
import { FunctionReturnType } from "convex/server"
import {
	LucideCopy,
	LucideEdit,
	LucideEye,
	LucideImageOff,
	LucideImagePlus,
	LucidePlay,
	LucideTrash,
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import * as v from "valibot"
import { api } from "../../convex/_generated/api.js"
import { Id } from "../../convex/_generated/dataModel"
import { SearchableList } from "../ui/SearchableList.tsx"
import {
	clearButton,
	clearPanel,
	fadeZoomTransition,
	heading2xl,
	panel,
} from "../ui/styles.ts"

export function SceneList({ roomId }: { roomId: Id<"rooms"> }) {
	const scenes = useQuery(api.functions.scenes.list, { room: roomId })
	const createScene = useMutation(api.functions.scenes.create)

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
				const storageIds = await Promise.all(
					files.map(async (file) => {
						try {
							const response = await fetch(
								new URL("/images", import.meta.env.VITE_CONVEX_API_URL),
								{
									method: "PUT",
									body: file,
									headers: { "Content-Type": file.type },
								},
							)

							if (!response.ok) {
								throw new Error(`Upload failed: ${await response.text()}`)
							}

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
	// const updateRoom = useMutation(api.functions.rooms.update)
	// const duplicateScene = useMutation(api.functions.scenes.duplicate)
	const removeScene = useMutation(api.functions.scenes.remove)

	return (
		<Ariakit.MenuProvider placement="bottom-start">
			<Ariakit.MenuButton
				className={panel(
					"group relative grid h-20 cursor-default select-none place-content-center overflow-clip",
				)}
				render={<figure />}
			>
				{scene.activeBackgroundUrl ? (
					<img
						src={scene.activeBackgroundUrl}
						alt=""
						className="absolute inset-0 size-full scale-110 object-cover blur-sm brightness-[35%] transition group-hover:blur-0 group-aria-expanded:blur-0"
					/>
				) : (
					<div className="absolute inset-0 grid place-content-center">
						<LucideImageOff className="size-16 opacity-25" />
					</div>
				)}
				<figcaption className="relative truncate px-4 text-center">
					<h3 className={heading2xl("min-w-0 truncate text-center text-xl")}>
						{scene.name}
					</h3>
					{scene.isActive && (
						<p className="relative flex items-center justify-center text-sm font-bold text-primary-200 opacity-75 gap-1">
							<LucidePlay className="size-4" />
							<span>Now playing</span>
						</p>
					)}
				</figcaption>
			</Ariakit.MenuButton>
			<Ariakit.Menu
				className={clearPanel(
					fadeZoomTransition(),
					"flex flex-wrap items-center justify-center p-1 gap-1",
				)}
				portal
				gutter={8}
				unmountOnHide
			>
				<Ariakit.MenuItem className="flex min-w-16 cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 transition gap-1 hover:bg-primary-600">
					<LucidePlay />
					<span className="text-xs/3 font-bold text-primary-200">Play</span>
				</Ariakit.MenuItem>
				<Ariakit.MenuItem className="flex min-w-16 cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 transition gap-1 hover:bg-primary-600">
					<LucideEye />
					<span className="text-xs/3 font-bold text-primary-200">View</span>
				</Ariakit.MenuItem>
				<Ariakit.MenuItem className="flex min-w-16 cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 transition gap-1 hover:bg-primary-600">
					<LucideEdit />
					<span className="text-xs/3 font-bold text-primary-200">Edit</span>
				</Ariakit.MenuItem>
				<Ariakit.MenuItem className="flex min-w-16 cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 transition gap-1 hover:bg-primary-600">
					<LucideCopy />
					<span className="text-xs/3 font-bold text-primary-200">
						Duplicate
					</span>
				</Ariakit.MenuItem>
				<Ariakit.MenuItem
					className="flex min-w-16 cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 text-red-300/75 transition gap-1 hover:bg-primary-600"
					onClick={() => removeScene({ id: scene._id })}
				>
					<LucideTrash />
					<span className="text-xs/3 font-bold">Delete</span>
				</Ariakit.MenuItem>
			</Ariakit.Menu>
		</Ariakit.MenuProvider>
	)
}
