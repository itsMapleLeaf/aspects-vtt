import { Focusable } from "@ariakit/react"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { useMutation } from "convex/react"
import {
	LucideEdit,
	LucideEye,
	LucideGrid2x2,
	LucideImage,
	LucideImageOff,
	LucideImagePlus,
	LucidePlay,
	LucideSave,
	LucideTrash,
	LucideX,
} from "lucide-react"
import { useState } from "react"
import { useDropzone } from "react-dropzone"
import * as v from "valibot"
import { api } from "../../convex/_generated/api.js"
import { Id } from "../../convex/_generated/dataModel"
import { EMPTY_ARRAY, hasLength } from "../../lib/array.ts"
import { useStableQuery } from "../../lib/convex.ts"
import { setToggle } from "../../lib/set.ts"
import { typed } from "../../lib/types.ts"
import { formDataSchema, formNumberSchema } from "../../lib/validation.ts"
import { uploadImage } from "../lib/uploadImage.ts"
import { ApiScene } from "../types.ts"
import { ActionRow, ActionRowItem } from "../ui/ActionRow.tsx"
import { EmptyState } from "../ui/empty-state.tsx"
import { FormField } from "../ui/form.tsx"
import { FormButton } from "../ui/FormButton.tsx"
import { ImageDropzone } from "../ui/ImageUploader.tsx"
import { InputField } from "../ui/input.tsx"
import { Modal, ModalPanel } from "../ui/modal.tsx"
import { PressEvent } from "../ui/Pressable.tsx"
import { SearchableList } from "../ui/SearchableList.tsx"
import { Select, SelectOption } from "../ui/Select.tsx"
import { Selectable } from "../ui/Selectable.tsx"
import {
	clearButton,
	errorText,
	formLayout,
	heading2xl,
	panel,
	solidButton,
} from "../ui/styles.ts"
import { ToastActionForm } from "../ui/toast.tsx"

export function SceneList({ roomId }: { roomId: Id<"rooms"> }) {
	const navigate = useNavigate()

	const [state, setState] = useState({
		search: "",
		selectedSceneIds: typed<ReadonlySet<Id<"scenes">>>(new Set<Id<"scenes">>()),
		lastSelectedSceneId: typed<Id<"scenes"> | null>(null),
		sceneEditorOpen: false,
		sceneEditorSceneId: typed<Id<"scenes"> | null>(null),
	})

	const scenes =
		useStableQuery(api.functions.scenes.list, {
			room: roomId,
			search: state.search,
		}) ?? EMPTY_ARRAY

	const createScene = useMutation(api.functions.scenes.create)
	const removeScenes = useMutation(api.functions.scenes.remove)
	const updateRoom = useMutation(api.functions.rooms.update)

	const sceneEditorScene = scenes.find(
		(scene) => scene._id === state.sceneEditorSceneId,
	)

	const selectedScenes = scenes.filter((scene) =>
		state.selectedSceneIds.has(scene._id),
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
							<SceneListCard scene={scene} />
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
					{hasLength(selectedScenes, 1) && (
						<>
							<ActionRowItem
								icon={<LucidePlay />}
								onClick={async () => {
									await updateRoom({
										id: roomId,
										activeSceneId: selectedScenes[0]._id,
									})
									navigate(`?preview=`)
								}}
							>
								Play
							</ActionRowItem>
							<ActionRowItem
								icon={<LucideEye />}
								to={`?preview=${selectedScenes[0]._id}`}
							>
								View
							</ActionRowItem>
							<ActionRowItem
								icon={<LucideEdit />}
								onClick={() => openSceneEditor(selectedScenes[0])}
							>
								Edit
							</ActionRowItem>
						</>
					)}

					<ActionRowItem icon={<LucideX />} onClick={clearSelection}>
						Dismiss
					</ActionRowItem>

					<ToastActionForm
						message="Deleting scene(s)..."
						action={() => {
							return removeScenes({
								ids: selectedScenes.map((scene) => scene._id),
							})
						}}
					>
						<ActionRowItem
							type="submit"
							icon={<LucideTrash />}
							className={errorText()}
						>
							Delete
						</ActionRowItem>
					</ToastActionForm>
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

			<Modal open={state.sceneEditorOpen} setOpen={setSceneEditorOpen}>
				<ModalPanel title="Edit scene">
					{sceneEditorScene ?
						<SceneEditorForm
							scene={sceneEditorScene}
							onSubmitSuccess={() => setSceneEditorOpen(false)}
						/>
					:	<EmptyState title="Scene not found" icon={<LucideImageOff />}>
							This scene has been deleted.
						</EmptyState>
					}
				</ModalPanel>
			</Modal>
		</div>
	)
}

function SceneEditorForm({
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

function SceneListCard({ scene }: { scene: ApiScene }) {
	const [searchParams] = useSearchParams()
	const previewSceneId = searchParams.get("preview")

	return (
		<figure
			className={panel(
				"group relative grid h-20 cursor-default select-none place-content-center overflow-clip",
			)}
			data-testid="scene-card"
		>
			{scene.activeBackgroundUrl ?
				<img
					src={scene.activeBackgroundUrl}
					alt=""
					className="absolute inset-0 size-full scale-110 object-cover blur-sm brightness-[35%] transition group-hover:blur-0 group-aria-expanded:blur-0"
				/>
			:	<div className="absolute inset-0 grid place-content-center">
					<LucideImageOff className="size-16 opacity-25" />
				</div>
			}
			<figcaption className="relative truncate px-4 text-center">
				<h3 className={heading2xl("min-w-0 truncate text-center text-xl")}>
					{scene.name}
				</h3>
				{scene.isActive ?
					<p className="relative flex items-center justify-center text-sm font-bold text-primary-200 opacity-75 gap-1">
						<LucidePlay className="size-4" />
						<span>Now playing</span>
					</p>
				: previewSceneId === scene._id ?
					<p className="relative flex items-center justify-center text-sm font-bold text-primary-200 opacity-75 gap-1">
						<LucideEye className="size-4" />
						<span>Previewing</span>
					</p>
				:	null}
			</figcaption>
		</figure>
	)
}
