import { Disclosure, DisclosureContent, useDisclosureStore } from "@ariakit/react"
import * as Lucide from "lucide-react"
import { createContext, Fragment, useCallback, useContext, useState } from "react"
import { z } from "zod"
import { useLocalStorageState } from "~/helpers/dom/useLocalStorage.ts"
import type { JsonValue } from "~/helpers/json.ts"
import { mod } from "~/helpers/math.ts"
import { Button, type ButtonPropsAsButton } from "~/ui/Button.tsx"
import { ContextMenu } from "~/ui/ContextMenu.tsx"
import { DeleteForm } from "~/ui/DeleteForm.tsx"
import { Input } from "~/ui/Input.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import { CharacterResourceGroup } from "../characters/CharacterResourceGroup.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { SceneResourceGroup } from "../scenes/SceneResourceGroup.tsx"

const ResourceTreeContext = createContext<{
	processItems: <Data>(
		items: ReadonlyArray<ResourceGroupItem<Data>>,
	) => ReadonlyArray<ResourceGroupItem<Data>>
}>({
	processItems: (items) => items,
})

export function ResourceTree() {
	const [search, setSearch] = useState("")
	const { sortMode, cycleSortMode } = useSorting()

	const processItems = useCallback(
		<Data,>(items: ReadonlyArray<ResourceGroupItem<Data>>) => {
			return items
				.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
				.sort((a, b) => sortMode.compare(a, b))
		},
		[search, sortMode],
	)

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
						<ResourceTreeContext.Provider value={{ processItems }}>
							<CharacterResourceGroup />
							<SceneResourceGroup />
						</ResourceTreeContext.Provider>
					</div>
				</ScrollArea>
			</div>
		</div>
	)
}

interface ResourceGroupItem<Data> {
	key: React.Key
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
	const [open, setOpen] = useState(false)
	const disclosure = useDisclosureStore({ open, setOpen })
	const { processItems } = useContext(ResourceTreeContext)
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
				<form action={props.add.action}>
					<Button
						type="submit"
						icon={props.add.icon}
						tooltip={props.add.label}
						appearance="clear"
						square
					/>
				</form>
			</div>
			<DisclosureContent store={disclosure} className="flex flex-col gap-1 pl-2">
				{processItems(props.items).map((item) => (
					<Fragment key={item.key}>{props.renderItem(item.data)}</Fragment>
				))}
			</DisclosureContent>
		</>
	)
}

interface ResourceTreeItemProps extends ButtonPropsAsButton {
	resourceName: string
	resourceType: string
	dragData?: JsonValue
	delete: () => Promise<void>
}

export function ResourceTreeItem({
	resourceName,
	resourceType,
	dragData,
	delete: deleteResource,
	...props
}: ResourceTreeItemProps) {
	const room = useRoom()

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

	return room.isOwner ?
			<ContextMenu>
				<ContextMenu.Trigger className="w-full">{button}</ContextMenu.Trigger>
				<ContextMenu.Panel unmountOnHide={false}>
					<DeleteForm kind={resourceType} name={resourceName} onConfirmDelete={deleteResource}>
						<ContextMenu.Item type="submit" icon={<Lucide.Trash />}>
							Delete
						</ContextMenu.Item>
					</DeleteForm>
				</ContextMenu.Panel>
			</ContextMenu>
		:	button
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
			compare: (a, b) => a.name.localeCompare(b.name),
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
