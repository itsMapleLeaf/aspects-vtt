import { Focusable } from "@ariakit/react"
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
	LucideSave,
	LucideTrash,
	LucideX,
} from "lucide-react"
import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { twMerge } from "tailwind-merge"
import * as v from "valibot"
import { api } from "../../convex/_generated/api.js"
import { Id } from "../../convex/_generated/dataModel"
import { hasLength } from "../../lib/array.ts"
import { useStableValue } from "../../lib/react.ts"
import { setToggle } from "../../lib/set.ts"
import { typed } from "../../lib/types.ts"
import { ActionRow, ActionRowItem } from "../ui/ActionRow.tsx"
import { FormButton } from "../ui/FormButton.tsx"
import { InputField } from "../ui/input.tsx"
import { Menu, MenuButton, MenuItem, MenuPanel } from "../ui/menu.tsx"
import { Modal, ModalPanel } from "../ui/modal.tsx"
import { Pressable, PressableProps, PressEvent } from "../ui/Pressable.tsx"
import { SearchableList } from "../ui/SearchableList.tsx"
import {
	clearButton,
	errorText,
	formLayout,
	heading2xl,
	panel,
	solidButton,
} from "../ui/styles.ts"
import { ToastActionForm } from "../ui/toast.tsx"

type ApiScene = FunctionReturnType<typeof api.functions.scenes.list>[number]

export function SceneList({ roomId }: { roomId: Id<"rooms"> }) {
	const [state, setState] = useState({
		search: "",
		selectedSceneIds: typed<ReadonlySet<Id<"scenes">>>(new Set<Id<"scenes">>()),
		lastSelectedSceneId: typed<Id<"scenes"> | null>(null),
		sceneEditorOpen: false,
		sceneEditorSceneId: typed<string | null>(null),
	})

	const scenes =
		useStableValue(
			useQuery(api.functions.scenes.list, {
				room: roomId,
				search: state.search,
			}),
		) ?? []

	const createScene = useMutation(api.functions.scenes.create)
	const updateScene = useMutation(api.functions.scenes.update)
	const removeScenes = useMutation(api.functions.scenes.remove)

	const selectedScenes = scenes.filter((scene) =>
		state.selectedSceneIds.has(scene._id),
	)

	const sceneEditorScene = scenes.find(
		(scene) => scene._id === state.sceneEditorSceneId,
	)

	const setSearch = (search: string) => {
		setState((current) => ({ ...current, search }))
	}

	const openSceneEditor = (scene: ApiScene) => {
		setState((current) => ({
			...current,
			sceneEditorOpen: true,
			sceneEditorSceneId: scene._id,
		}))
	}

	const setSceneEditorOpen = (open: boolean) => {
		setState((current) => ({ ...current, sceneEditorOpen: open }))
	}

	const clearSelection = () => {
		setState((current) => ({
			...current,
			selectedSceneIds: new Set<Id<"scenes">>(),
		}))
	}

	const handleScenePress = (scene: ApiScene, event: PressEvent) => {
		// ctrl should toggle the scene
		if (event.ctrlKey) {
			setState((current) => ({
				...current,
				selectedSceneIds: setToggle(current.selectedSceneIds, scene._id),
			}))
			return
		}

		// shift should do a range select from the last selected scene to the current one
		if (event.shiftKey) {
			const lastSelectedIndex = scenes.findIndex(
				(scene) => scene._id === state.lastSelectedSceneId,
			)
			const selectedIndex = scenes.findIndex((scene) => scene._id === scene._id)
			setState((current) => ({
				...current,
				selectedSceneIds: new Set(
					scenes
						.slice(
							Math.min(lastSelectedIndex, selectedIndex),
							Math.max(lastSelectedIndex, selectedIndex) + 1,
						)
						.map((scene) => scene._id),
				),
			}))
			return
		}

		// if selected, open the editor
		if (state.selectedSceneIds.has(scene._id)) {
			// this startTransition makes autoFocus work in the editor, for some reason
			openSceneEditor(scene)
			return
		}

		// otherwise, set the current scene as the only selected one
		setState((current) => ({
			...current,
			selectedSceneIds: new Set([scene._id]),
			lastSelectedSceneId: scene._id,
		}))
	}

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
		>
			<input {...dropzone.getInputProps()} />
			<div className="flex-1">
				<SearchableList
					search={state.search}
					onSearchChange={setSearch}
					items={scenes}
					renderItem={(scene) => (
						<Selectable
							active={state.selectedSceneIds.has(scene._id)}
							onPress={(event) => handleScenePress(scene, event)}
						>
							<SceneCard scene={scene} />
						</Selectable>
					)}
					actions={
						<ToastActionForm
							message="Creating scene..."
							action={async () => {
								const scene = await createScene({ name: "New scene", roomId })
								openSceneEditor(scene)
							}}
						>
							<FormButton className={clearButton()}>
								<LucideImagePlus />
								<span className="sr-only">Create scene</span>
							</FormButton>
						</ToastActionForm>
					}
				/>
			</div>

			{selectedScenes.length > 0 && (
				<ActionRow className="flex gap-1 *:flex-1">
					<ActionRowItem icon={<LucidePlay />}>Play</ActionRowItem>
					<ActionRowItem icon={<LucideEye />}>View</ActionRowItem>
					{hasLength(selectedScenes, 1) && (
						<ActionRowItem
							icon={<LucideEdit />}
							onClick={() => openSceneEditor(selectedScenes[0])}
						>
							Edit
						</ActionRowItem>
					)}
					<ActionRowItem icon={<LucideX />} onClick={clearSelection}>
						Dismiss
					</ActionRowItem>

					<Menu>
						<MenuButton
							render={<ActionRowItem icon={<LucideCircleEllipsis />} />}
						>
							More
						</MenuButton>

						<MenuPanel>
							<MenuItem>
								<LucidePin /> Pin
							</MenuItem>

							<MenuItem>
								<LucideCopy /> Clone
							</MenuItem>

							<ToastActionForm
								message="Deleting scene(s)..."
								action={() => {
									return removeScenes({
										ids: selectedScenes.map((scene) => scene._id),
									})
								}}
							>
								<MenuItem type="submit" className={errorText()}>
									<LucideTrash /> Delete
								</MenuItem>
							</ToastActionForm>
						</MenuPanel>
					</Menu>
				</ActionRow>
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

			{sceneEditorScene && (
				<Modal open={state.sceneEditorOpen} setOpen={setSceneEditorOpen}>
					<ModalPanel title="Edit scene">
						<ToastActionForm
							message="Saving scene..."
							action={async (formData) => {
								await updateScene({
									id: sceneEditorScene._id,
									name: formData.get("name") as string,
								})
								setSceneEditorOpen(false)
							}}
							className={formLayout()}
							key={sceneEditorScene._id}
						>
							<Focusable
								autoFocus
								render={
									<InputField
										label="Name"
										name="name"
										defaultValue={sceneEditorScene.name}
										required
									/>
								}
							/>
							{/* todo: backgrounds */}
							<FormButton className={solidButton()}>
								<LucideSave /> Save
							</FormButton>
						</ToastActionForm>
					</ModalPanel>
				</Modal>
			)}
		</div>
	)
}

function SceneCard({ scene }: { scene: ApiScene }) {
	return (
		<figure
			className={panel(
				"group relative grid h-20 cursor-default select-none place-content-center overflow-clip",
			)}
			data-testid="scene-card"
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
}

function Selectable({
	children,
	active,
	...props
}: PressableProps & {
	active: boolean
	onPress?: (event: React.PointerEvent) => void
}) {
	return (
		<Pressable
			{...props}
			data-selectable-active={active || undefined}
			className={twMerge("relative block w-full", props.className)}
		>
			{children}
			<div
				className="pointer-events-none absolute inset-0 grid scale-95 place-content-center rounded-lg border-2 border-accent-500 bg-accent-800/60 text-accent-600 opacity-0 transition data-[active]:scale-100 data-[active]:opacity-100"
				data-active={active || undefined}
			></div>
		</Pressable>
	)
}
