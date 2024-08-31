import { useMutation, useQuery } from "convex/react"
import { FunctionReturnType } from "convex/server"
import {
	LucideCircleEllipsis,
	LucideCopy,
	LucideEdit,
	LucideEye,
	LucideImageOff,
	LucideImagePlus,
	LucidePin,
	LucidePlay,
	LucideTrash,
	LucideX,
} from "lucide-react"
import { useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import * as v from "valibot"
import { api } from "../../convex/_generated/api.js"
import { Id } from "../../convex/_generated/dataModel"
import { useSet } from "../../lib/react.ts"
import { FormButton } from "../ui/FormButton.tsx"
import { Menu, MenuButton, MenuItem, MenuPanel } from "../ui/menu.tsx"
import { SearchableList } from "../ui/SearchableList.tsx"
import { clearButton, heading2xl, panel } from "../ui/styles.ts"
import { toastAction } from "../ui/toast.ts"

export function SceneList({ roomId }: { roomId: Id<"rooms"> }) {
	const scenes = useQuery(api.functions.scenes.list, { room: roomId })
	const createScene = useMutation(api.functions.scenes.create)
	const removeScenes = useMutation(api.functions.scenes.remove)
	const [selection, selectionActions] = useSet<Id<"scenes">>()
	const [latestSelected, setLatestSelected] = useState<Id<"scenes">>()
	const selectedScenes = (scenes ?? []).filter((scene) =>
		selection.has(scene._id),
	)
	const containerRef = useRef<HTMLDivElement>(null)

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
		<div
			{...dropzone.getRootProps()}
			className="relative flex h-full flex-col gap-3"
			ref={containerRef}
		>
			<input {...dropzone.getInputProps()} />
			<div className="flex-1">
				<SearchableList
					items={scenes ?? []}
					renderItem={(scene, scenes) => (
						<div
							onPointerDown={(event) => {
								if (event.ctrlKey) {
									selectionActions.toggle(scene._id)
									setLatestSelected(scene._id)
								} else if (event.shiftKey) {
									if (latestSelected == null) {
										selectionActions.set([scene._id])
										setLatestSelected(scene._id)
									} else {
										const sceneIds = scenes.map((scene) => scene._id)
										const latestIndex = sceneIds.indexOf(latestSelected)
										const currentIndex = sceneIds.indexOf(scene._id)
										selectionActions.set(
											scenes
												.slice(
													Math.min(latestIndex, currentIndex),
													Math.max(latestIndex, currentIndex) + 1,
												)
												.map((scene) => scene._id),
										)
									}
								} else {
									selectionActions.set([scene._id])
									setLatestSelected(scene._id)
								}
							}}
							className="relative"
						>
							<SceneCard scene={scene} />
							<div
								className="pointer-events-none absolute inset-0 grid scale-95 place-content-center rounded-lg border-2 border-accent-500 bg-accent-800/60 text-accent-600 opacity-0 transition data-[active]:scale-100 data-[active]:opacity-100"
								data-active={selection.has(scene._id) || undefined}
							></div>
						</div>
					)}
					searchKeys={["name"]}
					actions={
						<form
							action={toastAction("Creating scene...", () => {
								return createScene({
									name: "New scene",
									roomId,
								})
							})}
						>
							<FormButton className={clearButton()}>
								<LucideImagePlus />
								<span className="sr-only">Create scene</span>
							</FormButton>
						</form>
					}
				/>
			</div>

			{selectedScenes.length > 0 && (
				<div className="flex gap-1 *:flex-1">
					<button
						type="button"
						className="flex cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 text-primary-200 transition gap-1 hover:bg-primary-600"
					>
						<LucidePlay />
						<span className="text-xs/3 font-bold">Play</span>
					</button>
					<button
						type="button"
						className="flex cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 text-primary-200 transition gap-1 hover:bg-primary-600"
					>
						<LucideEye />
						<span className="text-xs/3 font-bold">View</span>
					</button>
					<button
						type="button"
						className="flex cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 text-primary-200 transition gap-1 hover:bg-primary-600"
					>
						<LucideEdit />
						<span className="text-xs/3 font-bold">Edit</span>
					</button>
					<button
						type="button"
						className="flex cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 text-primary-200 transition gap-1 hover:bg-primary-600"
						onClick={() => selectionActions.clear()}
					>
						<LucideX />
						<span className="text-xs/3 font-bold">Dismiss</span>
					</button>
					<Menu>
						<MenuButton className="flex cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 text-primary-200 transition gap-1 hover:bg-primary-600">
							<LucideCircleEllipsis />
							<span className="text-xs/3 font-bold">More</span>
						</MenuButton>
						<MenuPanel>
							<MenuItem>
								<LucidePin /> Pin
							</MenuItem>
							<MenuItem>
								<LucideCopy /> Clone
							</MenuItem>
							<form
								className="contents"
								// action={() => {
								// 	return toast
								// 		.promise(
								// 			throttle(
								// 				1000,
								// 				removeScenes({
								// 					ids: selectedScenes.map((scene) => scene._id),
								// 				}),
								// 			),
								// 			{
								// 				pending: `Deleting ${selectedScenes.length} scenes...`,
								// 				error: "Something went wrong.",
								// 			},
								// 		)
								// 		.catch(console.error)
								// }}
								action={toastAction(
									`Deleting ${selectedScenes.length} scene(s)...`,
									() => {
										return removeScenes({
											ids: selectedScenes.map((scene) => scene._id),
										})
									},
								)}
							>
								<MenuItem type="submit">
									<LucideTrash /> Delete
								</MenuItem>
							</form>
						</MenuPanel>
					</Menu>
					{/* <button
						type="button"
						className="flex min-w-16 cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 text-red-300/75 transition gap-1 hover:bg-primary-600"
						// onClick={() => removeScene({ id: scene._id })}
					>
						<LucideTrash />
						<span className="text-xs/3 font-bold">Delete</span>
					</button> */}
				</div>
			)}

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
		<figure
			className={panel(
				"group relative grid h-20 cursor-default select-none place-content-center overflow-clip",
			)}
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
		</figure>
	)

	// const updateRoom = useMutation(api.functions.rooms.update)
	// const duplicateScene = useMutation(api.functions.scenes.duplicate)
	// const removeScene = useMutation(api.functions.scenes.remove)

	// return (
	// 	<Ariakit.MenuProvider placement="bottom-start">
	// 		<Ariakit.MenuButton
	// 			className={panel(
	// 				"group relative grid h-20 cursor-default select-none place-content-center overflow-clip",
	// 			)}
	// 			render={<figure />}
	// 		>
	// 			{scene.activeBackgroundUrl ? (
	// 				<img
	// 					src={scene.activeBackgroundUrl}
	// 					alt=""
	// 					className="absolute inset-0 size-full scale-110 object-cover blur-sm brightness-[35%] transition group-hover:blur-0 group-aria-expanded:blur-0"
	// 				/>
	// 			) : (
	// 				<div className="absolute inset-0 grid place-content-center">
	// 					<LucideImageOff className="size-16 opacity-25" />
	// 				</div>
	// 			)}
	// 			<figcaption className="relative truncate px-4 text-center">
	// 				<h3 className={heading2xl("min-w-0 truncate text-center text-xl")}>
	// 					{scene.name}
	// 				</h3>
	// 				{scene.isActive && (
	// 					<p className="relative flex items-center justify-center text-sm font-bold text-primary-200 opacity-75 gap-1">
	// 						<LucidePlay className="size-4" />
	// 						<span>Now playing</span>
	// 					</p>
	// 				)}
	// 			</figcaption>
	// 		</Ariakit.MenuButton>
	// 		<Ariakit.Menu
	// 			className={clearPanel(
	// 				fadeZoomTransition(),
	// 				"flex flex-wrap items-center justify-center p-1 gap-1",
	// 			)}
	// 			portal
	// 			gutter={8}
	// 			unmountOnHide
	// 		>
	// 			<Ariakit.MenuItem className="flex min-w-16 cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 transition gap-1 hover:bg-primary-600">
	// 				<LucidePlay />
	// 				<span className="text-xs/3 font-bold text-primary-200">Play</span>
	// 			</Ariakit.MenuItem>
	// 			<Ariakit.MenuItem className="flex min-w-16 cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 transition gap-1 hover:bg-primary-600">
	// 				<LucideEye />
	// 				<span className="text-xs/3 font-bold text-primary-200">View</span>
	// 			</Ariakit.MenuItem>
	// 			<Ariakit.MenuItem className="flex min-w-16 cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 transition gap-1 hover:bg-primary-600">
	// 				<LucideEdit />
	// 				<span className="text-xs/3 font-bold text-primary-200">Edit</span>
	// 			</Ariakit.MenuItem>
	// 			<Ariakit.MenuItem className="flex min-w-16 cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 transition gap-1 hover:bg-primary-600">
	// 				<LucideCopy />
	// 				<span className="text-xs/3 font-bold text-primary-200">
	// 					Duplicate
	// 				</span>
	// 			</Ariakit.MenuItem>
	// 			<Ariakit.MenuItem
	// 				className="flex min-w-16 cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 text-red-300/75 transition gap-1 hover:bg-primary-600"
	// 				onClick={() => removeScene({ id: scene._id })}
	// 			>
	// 				<LucideTrash />
	// 				<span className="text-xs/3 font-bold">Delete</span>
	// 			</Ariakit.MenuItem>
	// 		</Ariakit.Menu>
	// 	</Ariakit.MenuProvider>
	// )
}
