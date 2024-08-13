import {
	Disclosure,
	DisclosureContent,
	useDisclosureStore,
} from "@ariakit/react"
import * as Lucide from "lucide-react"
import {
	Fragment,
	createContext,
	startTransition,
	use,
	useContext,
	useState,
} from "react"
import { z } from "zod"
import {
	useLocalStorageState,
	useLocalStorageSwitch,
} from "~/helpers/dom/useLocalStorage.ts"
import type { JsonValue } from "~/helpers/json.ts"
import { mod } from "~/helpers/math.ts"
import type { Nullish } from "~/helpers/types.ts"
import { Button, type ButtonPropsAsButton } from "~/ui/Button.tsx"
import { DeleteForm } from "~/ui/DeleteForm.tsx"
import { Input } from "~/ui/Input.tsx"
import { Menu, MenuItem, MenuPanel, MenuToggle } from "~/ui/Menu.v2.tsx"
import { Portal } from "~/ui/Portal.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import type { Id } from "../../../convex/_generated/dataModel"
import { CharacterResourceGroup } from "../characters/CharacterResourceGroup.tsx"
import { RoomOwnerOnly, useRoom } from "../rooms/roomContext.tsx"
import { SceneResourceGroup } from "../scenes/SceneResourceGroup.tsx"

interface SortMode {
	readonly id: string
	readonly name: string
	readonly icon: React.ReactNode
	readonly compare: (
		a: ResourceGroupItem<unknown>,
		b: ResourceGroupItem<unknown>,
	) => number
}

const sortModes: [SortMode, ...SortMode[]] = [
	{
		id: "recently-created",
		name: "Recently created",
		icon: <Lucide.FileClock />,
		compare: (a, b) => b.timestamp - a.timestamp,
	},
	{
		id: "alphabetical",
		name: "Alphabetical",
		icon: <Lucide.ArrowDownAZ />,
		compare: (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
	},
]

const ResourceTreeContext = createContext<{
	search: string
	sortMode: SortMode
	pinned: ReadonlySet<string>
	setPinned: (resourceId: string, pinned: boolean) => void
	pinnedItemsContainer: Nullish<HTMLElement>
}>({
	search: "",
	sortMode: sortModes[0],
	pinned: new Set(),
	setPinned(resourceId, pinned) {
		console.warn("called setPinned outside context")
	},
	pinnedItemsContainer: undefined,
})

function useResourceTreeContext<T>(items: ReadonlyArray<ResourceGroupItem<T>>) {
	const { search, sortMode, pinned, setPinned, ...context } =
		use(ResourceTreeContext)

	const processedItems = items
		.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
		.sort((a, b) => sortMode.compare(a, b))

	const isPinned = (id: string) => pinned.has(id)
	const addPinned = (id: string) => setPinned(id, true)
	const removePinned = (id: string) => setPinned(id, true)
	const togglePinned = (id: string) => setPinned(id, !isPinned(id))

	return {
		...context,
		items: processedItems,
		isPinned,
		addPinned,
		removePinned,
		togglePinned,
	}
}

export function ResourceTree({ sceneId }: { sceneId: Nullish<Id<"scenes">> }) {
	const [search, setSearch] = useState("")
	const { sortMode, cycleSortMode } = useSorting()
	const [pinnedResourceIds, setPinnedResourceIds] = useLocalStorageState<
		readonly string[]
	>("pinnedResources", [], z.array(z.string()))
	const [pinnedItemsContainer, setPinnedItemsContainer] =
		useState<HTMLElement | null>()

	const setResourcePinned = (resourceId: string, pinned: boolean) => {
		if (pinned) {
			setPinnedResourceIds((current) => [...current, resourceId])
		} else {
			setPinnedResourceIds((current) =>
				current.filter((it) => it !== resourceId),
			)
		}
	}

	return (
		<div className="flex h-full flex-col gap-2">
			<div className="flex items-center gap-2">
				<Input
					value={search}
					onChangeValue={setSearch}
					placeholder="Search..."
					icon={<Lucide.Search />}
				/>
				<Button
					icon={sortMode.icon}
					tooltip="Change sort mode"
					onClick={cycleSortMode}
					appearance="clear"
					square
				/>
			</div>
			<div className="flex min-h-0 flex-1 flex-col gap-1">
				<ScrollArea scrollbarPosition="outside" scrollbarGap={8}>
					<div className="flex flex-col gap-current">
						<div className="contents" ref={setPinnedItemsContainer}></div>
						<ResourceTreeContext
							value={{
								search,
								sortMode,
								pinned: new Set(pinnedResourceIds),
								setPinned: setResourcePinned,
								pinnedItemsContainer,
							}}
						>
							<CharacterResourceGroup
								id="characters"
								title="All Characters"
								sceneId={null}
							/>
							{sceneId && (
								<CharacterResourceGroup
									id="sceneCharacters"
									title="Scene Characters"
									sceneId={sceneId}
								/>
							)}
							<SceneResourceGroup />
						</ResourceTreeContext>
					</div>
				</ScrollArea>
			</div>
		</div>
	)
}

interface ResourceGroupItem<Data> {
	id: string
	name: string
	timestamp: number
	data: Data
}

export function ResourceGroup<ItemData>(props: {
	id: string
	name: string
	add: {
		label: string
		icon: React.ReactNode
		action: () => Promise<void>
	}
	items: ReadonlyArray<ResourceGroupItem<ItemData>>
	renderItem: (data: ItemData) => React.ReactNode
}) {
	const room = useRoom()
	const [open, setOpen] = useLocalStorageSwitch(
		`resource-tree-group:${props.id}`,
		false,
	)
	const disclosure = useDisclosureStore({
		open,
		setOpen: (open) => {
			startTransition(() => setOpen(open))
		},
	})
	const context = useResourceTreeContext(props.items)

	if (context.items.length === 0 && !room.isOwner) {
		return null
	}

	const pinnedItems = context.items.filter((it) => context.isPinned(it.id))

	const folderIcon = open ? <Lucide.FolderOpen /> : <Lucide.Folder />

	return (
		<>
			<div className="flex gap-1">
				<Disclosure
					store={disclosure}
					render={
						<Button
							icon={folderIcon}
							appearance="clear"
							align="start"
							className="flex-1"
						/>
					}
				>
					{props.name}
				</Disclosure>
				<RoomOwnerOnly>
					<form action={props.add.action}>
						<Button
							type="submit"
							icon={props.add.icon}
							tooltip={props.add.label}
							appearance="clear"
							square
						/>
					</form>
				</RoomOwnerOnly>
			</div>
			{context.items.length > 0 && (
				<DisclosureContent
					store={disclosure}
					unmountOnHide
					className="flex flex-col pl-2 gap-1"
				>
					{context.items.map((item) => (
						<Fragment key={item.id}>{props.renderItem(item.data)}</Fragment>
					))}
				</DisclosureContent>
			)}
			<Portal
				enabled={pinnedItems.length > 0}
				container={context.pinnedItemsContainer}
			>
				{pinnedItems.map((item) => (
					<Fragment key={item.id}>{props.renderItem(item.data)}</Fragment>
				))}
			</Portal>
		</>
	)
}

interface ResourceTreeItemProps extends ButtonPropsAsButton {
	resourceId: string
	resourceName: string
	resourceType: string
	dragData?: JsonValue
	delete: () => Promise<void>
}

export function ResourceTreeItem({
	resourceId,
	resourceName,
	resourceType,
	dragData,
	delete: deleteResource,
	...props
}: ResourceTreeItemProps) {
	const context = useContext(ResourceTreeContext)
	const [open, setOpen] = useState(false)

	const dragProps =
		dragData ?
			{
				draggable: true,
				onDragStart: (event: React.DragEvent<HTMLButtonElement>) => {
					event.dataTransfer.setData("text/plain", JSON.stringify(dragData))
					event.dataTransfer.dropEffect = "copy"
				},
			}
		:	{}

	const button = (
		<MenuToggle
			element={
				<Button
					appearance="clear"
					align="start"
					{...dragProps}
					{...withMergedClassName(props, "w-full")}
					onClick={(event) => {
						props.onClick?.(event)
						event.preventDefault()
					}}
					onContextMenu={(event) => {
						event.preventDefault()
						setOpen(true)
					}}
				/>
			}
		/>
	)

	return (
		<Menu open={open} setOpen={setOpen}>
			{button}
			<MenuPanel>
				{context.pinned.has(resourceId) ?
					<MenuItem
						icon={<Lucide.PinOff />}
						onClick={() => {
							context.setPinned(resourceId, false)
						}}
					>
						Unpin
					</MenuItem>
				:	<MenuItem
						icon={<Lucide.Pin />}
						onClick={() => {
							context.setPinned(resourceId, true)
						}}
					>
						Pin
					</MenuItem>
				}

				<RoomOwnerOnly>
					<DeleteForm
						kind={resourceType}
						name={resourceName}
						onConfirmDelete={deleteResource}
						className="contents"
					>
						<MenuItem
							type="submit"
							icon={<Lucide.Trash />}
							onClick={(event) => {
								event.preventDefault()
								event.currentTarget.form?.requestSubmit()
							}}
						>
							Delete
						</MenuItem>
					</DeleteForm>
				</RoomOwnerOnly>
			</MenuPanel>
		</Menu>
	)
}

function useSorting() {
	const [sortModeId, setSortModeId] = useLocalStorageState(
		"room-resource-tree-sort-mode",
		sortModes[0].id,
		z.string(),
	)
	const sortMode = sortModes.find((it) => it.id === sortModeId) ?? sortModes[0]

	const cycleSortMode = () => {
		setSortModeId((sortModeId) => {
			const index = sortModes.findIndex((it) => it.id === sortModeId)
			const nextSortMode =
				sortModes[mod(index + 1, sortModes.length)] ?? sortModes[0]
			return nextSortMode.id
		})
	}

	return { sortMode, cycleSortMode }
}
