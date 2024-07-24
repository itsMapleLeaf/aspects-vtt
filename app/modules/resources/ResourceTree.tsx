import { Disclosure, DisclosureContent, useDisclosureStore } from "@ariakit/react"
import * as Lucide from "lucide-react"
import { Fragment, createContext, startTransition, useContext, useState } from "react"
import { z } from "zod"
import { useLocalStorageState, useLocalStorageSwitch } from "~/helpers/dom/useLocalStorage.ts"
import type { JsonValue } from "~/helpers/json.ts"
import { mod } from "~/helpers/math.ts"
import type { Nullish } from "~/helpers/types.ts"
import { Button, type ButtonPropsAsButton } from "~/ui/Button.tsx"
import { ContextMenu } from "~/ui/ContextMenu.tsx"
import { DeleteForm } from "~/ui/DeleteForm.tsx"
import { Input } from "~/ui/Input.tsx"
import { Portal } from "~/ui/Portal.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import type { Id } from "../../../convex/_generated/dataModel"
import { CharacterResourceGroup } from "../characters/CharacterResourceGroup.tsx"
import { RoomOwnerOnly, useRoom } from "../rooms/roomContext.tsx"
import { SceneResourceGroup } from "../scenes/SceneResourceGroup.tsx"

const ResourceTreeContext = createContext<{
	processItems: <Data>(
		items: ReadonlyArray<ResourceGroupItem<Data>>,
	) => ReadonlyArray<ResourceGroupItem<Data>>
	pinned: ReadonlySet<string>
	setPinned: (resourceId: string, pinned: boolean) => void
	pinnedItemsContainer: Nullish<HTMLElement>
}>({
	processItems: (items) => items,
	pinned: new Set(),
	setPinned(resourceId, pinned) {
		console.warn("called setPinned outside context")
	},
	pinnedItemsContainer: undefined,
})

export function ResourceTree({ sceneId }: { sceneId: Nullish<Id<"scenes">> }) {
	const [search, setSearch] = useState("")
	const { sortMode, cycleSortMode } = useSorting()
	const [pinnedResourceIds, setPinnedResourceIds] = useLocalStorageState<readonly string[]>(
		"pinnedResources",
		[],
		z.array(z.string()),
	)
	const [pinnedItemsContainer, setPinnedItemsContainer] = useState<HTMLElement | null>()

	const processItems = <Data,>(items: ReadonlyArray<ResourceGroupItem<Data>>) =>
		items
			.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
			.sort((a, b) => sortMode.compare(a, b))

	const setResourcePinned = (resourceId: string, pinned: boolean) => {
		if (pinned) {
			setPinnedResourceIds((current) => [...current, resourceId])
		} else {
			setPinnedResourceIds((current) => current.filter((it) => it !== resourceId))
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
						<ResourceTreeContext.Provider
							value={{
								processItems,
								pinned: new Set(pinnedResourceIds),
								setPinned: setResourcePinned,
								pinnedItemsContainer,
							}}
						>
							<CharacterResourceGroup id="characters" title="All Characters" sceneId={null} />
							{sceneId && (
								<CharacterResourceGroup
									id="sceneCharacters"
									title="Scene Characters"
									sceneId={sceneId}
								/>
							)}
							<SceneResourceGroup />
						</ResourceTreeContext.Provider>
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
	const [open, setOpen] = useLocalStorageSwitch(`resource-tree-group:${props.id}`, false)
	const disclosure = useDisclosureStore({
		open,
		setOpen: (open) => {
			startTransition(() => setOpen(open))
		},
	})
	const context = useContext(ResourceTreeContext)

	if (props.items.length === 0 && !room.isOwner) {
		return null
	}

	const items = context.processItems(props.items ?? [])
	const pinnedItems = context.processItems(props.items.filter((it) => context.pinned.has(it.id)))

	const folderIcon = open ? <Lucide.FolderOpen /> : <Lucide.Folder />

	return (
		<>
			<div className="flex gap-1">
				<Disclosure
					store={disclosure}
					render={<Button icon={folderIcon} appearance="clear" align="start" className="flex-1" />}
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
			{items.length > 0 && (
				<DisclosureContent store={disclosure} unmountOnHide className="flex flex-col pl-2 gap-1">
					{items.map((item) => (
						<Fragment key={item.id}>{props.renderItem(item.data)}</Fragment>
					))}
				</DisclosureContent>
			)}
			<Portal enabled={pinnedItems.length > 0} container={context.pinnedItemsContainer}>
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
		<Button
			appearance="clear"
			align="start"
			{...dragProps}
			{...withMergedClassName(props, "w-full")}
		/>
	)

	return (
		<ContextMenu>
			<ContextMenu.Trigger className="w-full">{button}</ContextMenu.Trigger>
			<ContextMenu.Panel unmountOnHide={false}>
				{context.pinned.has(resourceId) ?
					<ContextMenu.Item
						icon={<Lucide.PinOff />}
						onClick={() => {
							context.setPinned(resourceId, false)
						}}
					>
						Unpin
					</ContextMenu.Item>
				:	<ContextMenu.Item
						icon={<Lucide.Pin />}
						onClick={() => {
							context.setPinned(resourceId, true)
						}}
					>
						Pin
					</ContextMenu.Item>
				}

				<RoomOwnerOnly>
					<DeleteForm kind={resourceType} name={resourceName} onConfirmDelete={deleteResource}>
						<ContextMenu.Item type="submit" icon={<Lucide.Trash />}>
							Delete
						</ContextMenu.Item>
					</DeleteForm>
				</RoomOwnerOnly>
			</ContextMenu.Panel>
		</ContextMenu>
	)
}

interface SortMode {
	readonly id: string
	readonly name: string
	readonly icon: React.ReactNode
	readonly compare: (a: ResourceGroupItem<unknown>, b: ResourceGroupItem<unknown>) => number
}

function useSorting() {
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

	const [sortModeId, setSortModeId] = useLocalStorageState(
		"room-resource-tree-sort-mode",
		sortModes[0].id,
		z.string(),
	)
	const sortMode = sortModes.find((it) => it.id === sortModeId) ?? sortModes[0]

	const cycleSortMode = () => {
		setSortModeId((sortModeId) => {
			const index = sortModes.findIndex((it) => it.id === sortModeId)
			const nextSortMode = sortModes[mod(index + 1, sortModes.length)] ?? sortModes[0]
			return nextSortMode.id
		})
	}

	return { sortMode, cycleSortMode }
}
