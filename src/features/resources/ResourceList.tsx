import { useMutation } from "convex/react"
import { startCase } from "lodash-es"
import {
	LucideImagePlus,
	LucideMap,
	LucidePlus,
	LucideUserPlus,
} from "lucide-react"
import { ComponentProps, useState } from "react"
import { twMerge } from "tailwind-merge"
import { api } from "../../../convex/_generated/api.js"
import { useStableQuery } from "../../lib/convex.tsx"
import { useDebouncedValue, useSet } from "../../lib/react.ts"
import { StrictOmit } from "../../lib/types.ts"
import { PressEvent, Pressable, PressableProps } from "../../ui/Pressable.tsx"
import { SelectionOverlay } from "../../ui/SelectionOverlay"
import { Menu, MenuButton, MenuItem, MenuPanel } from "../../ui/menu.tsx"
import { Modal, ModalPanel } from "../../ui/modal.tsx"
import {
	clearIconButton,
	heading2xl,
	innerPanel,
	input,
} from "../../ui/styles.ts"
import { ToastActionForm } from "../../ui/toast.tsx"
import { CharacterAvatar } from "../characters/CharacterAvatar.tsx"
import { CharacterEditorForm } from "../characters/CharacterEditorForm.tsx"
import { uploadImage } from "../images/uploadImage.ts"
import { ApiRoom } from "../rooms/types.ts"
import { SceneEditorForm } from "../scenes/SceneEditorForm.tsx"

interface Resource {
	id: string
	name: string
	icon: React.ReactNode
	editor: () => React.ReactNode
}

interface ResourceSection {
	resourceName: string
	resources: Resource[] | undefined
	create: {
		icon: React.ReactNode
		action: () => Promise<{ id: string }>
	}
}

export interface ResourceListProps extends ComponentProps<"div"> {
	room: ApiRoom
}

export function ResourceList({ room, ...props }: ResourceListProps) {
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 400)

	const characters = useStableQuery(api.functions.characters.list, {
		roomId: room._id,
		search: debouncedSearch,
	})

	const createCharacter = useMutation(api.functions.characters.create)
	const updateCharacter = useMutation(api.functions.characters.update)

	const scenes = useStableQuery(api.functions.scenes.list, {
		roomId: room._id,
		search: debouncedSearch,
	})

	const createScene = useMutation(api.functions.scenes.create)

	const sections: ResourceSection[] = [
		{
			resourceName: "character",
			resources: characters?.map((character) => ({
				id: character._id,
				name: character.name,
				icon: <CharacterAvatar character={character} className="bg-top" />,
				editor: () => (
					<CharacterEditorForm
						character={character}
						action={async ({ image, ...data }) => {
							const imageId = image ? await uploadImage(image) : undefined
							await updateCharacter({
								...data,
								imageId,
								characterId: character._id,
							})
						}}
					/>
				),
			})),
			create: {
				icon: <LucideUserPlus />,
				action: async () => {
					const id = await createCharacter({ roomId: room._id })
					return { id }
				},
			},
		},
		{
			resourceName: "scene",
			resources: scenes?.map((scene) => ({
				id: scene._id,
				name: scene.name,
				icon: <LucideMap />,
				editor: () => <SceneEditorForm scene={scene} />,
			})),
			create: {
				icon: <LucideImagePlus />,
				action: async () => {
					const id = await createScene({ roomId: room._id })
					return { id }
				},
			},
		},
	]

	const resources = sections.flatMap((section) => section.resources ?? [])

	const getResourceIndex = (resourceId: string) =>
		resources.findIndex((it) => it.id === resourceId)

	const [selectedResourceIds, selectedResourceIdActions] = useSet<string>()
	const [rangeSelectStart, setRangeSelectStart] = useState<string>()

	const handleResourcePress = (event: PressEvent, resourceId: string) => {
		if (event.ctrlKey) {
			selectedResourceIdActions.toggle(resourceId)
			setRangeSelectStart(resourceId)
		} else if (event.shiftKey) {
			const [start, end] = normalizeRange(
				getResourceIndex(rangeSelectStart ?? resourceId),
				getResourceIndex(resourceId),
			)
			selectedResourceIdActions.set(
				resources.slice(start, end + 1).map((it) => it.id),
			)
		} else {
			selectedResourceIdActions.set([resourceId])
			setRangeSelectStart(resourceId)
		}
	}

	const [editorOpen, setEditorOpen] = useState(false)
	const [editingResourceId, setEditingResourceId] = useState<string>()

	const editingResource = sections
		.flatMap((section) => section.resources)
		.find((resource) => resource?.id === editingResourceId)

	const openEditor = (resourceId: string) => {
		setEditingResourceId(resourceId)
		setEditorOpen(true)
	}

	return (
		<div
			{...props}
			className={twMerge("flex h-full flex-col gap-4", props.className)}
		>
			<div className="flex gap-2">
				<input
					type="text"
					placeholder="Search"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					className={input("flex-1")}
				/>
				<CreateResourceMenu sections={sections} afterCreate={openEditor} />
			</div>

			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto gap">
				{sections
					.filter((section) => section.resources?.length)
					.map((section) => (
						<ResourceListSection key={section.resourceName} section={section}>
							<ul className="flex flex-col gap-1">
								{section.resources?.map((resource) => (
									<li key={resource.id} className="contents">
										<ResourceListItem
											resource={resource}
											selected={selectedResourceIds.has(resource.id)}
											onPress={(event) =>
												handleResourcePress(event, resource.id)
											}
											onDoublePress={(event) => {
												if (!event.ctrlKey && !event.shiftKey) {
													openEditor(resource.id)
												} else {
													handleResourcePress(event, resource.id)
												}
											}}
										/>
									</li>
								))}
							</ul>
						</ResourceListSection>
					))}
			</div>

			{editingResource && (
				<Modal open={editorOpen}>
					<ModalPanel
						title={`Editing ${editingResource.name}`}
						onClose={() => setEditorOpen(false)}
					>
						{editingResource?.editor()}
					</ModalPanel>
				</Modal>
			)}
		</div>
	)
}

function ResourceListSection({
	section,
	children,
}: {
	section: ResourceSection
	children: React.ReactNode
}) {
	return (
		<section key={section.resourceName}>
			<h3 className={heading2xl("mb-1 opacity-50")}>
				{startCase(section.resourceName)}s
			</h3>
			{children}
		</section>
	)
}

function ResourceListItem({
	resource,
	selected,
	...props
}: StrictOmit<PressableProps, "resource"> & {
	resource: Resource
	selected: boolean
}) {
	return (
		<Pressable
			{...props}
			className={innerPanel(
				"relative flex h-14 items-center justify-start px-3 text-start transition gap-2 hover:bg-primary-800",
				props.className,
			)}
		>
			<div aria-hidden className="*:size-8">
				{resource.icon}
			</div>
			<p>{resource.name}</p>
			<SelectionOverlay visible={selected} />
		</Pressable>
	)
}

function CreateResourceMenu({
	sections,
	afterCreate,
}: {
	sections: ResourceSection[]
	afterCreate: (id: string) => void
}) {
	return (
		<Menu>
			<MenuButton className={clearIconButton()}>
				<LucidePlus />
				<span className="sr-only">New...</span>
			</MenuButton>
			<MenuPanel>
				{sections.map((section) => (
					<ToastActionForm
						key={section.resourceName}
						action={async () => {
							const { id } = await section.create.action()
							afterCreate(id)
						}}
						message={`Creating ${section.resourceName}...`}
					>
						<MenuItem key={section.resourceName} type="submit">
							{section.create.icon}
							{`Create ${startCase(section.resourceName)}`}
						</MenuItem>
					</ToastActionForm>
				))}
			</MenuPanel>
		</Menu>
	)
}

function normalizeRange(start: number, end: number) {
	return [Math.min(start, end), Math.max(start, end)] as const
}
