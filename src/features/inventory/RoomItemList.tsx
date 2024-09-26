import { useMutation } from "convex/react"
import {
	LucideCopy,
	LucideEdit,
	LucidePackagePlus,
	LucideTrash,
} from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState, type ReactNode } from "react"
import { Button } from "~/components/Button.tsx"
import { Dialog } from "~/components/Dialog.tsx"
import { Menu } from "~/components/Menu.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { useRoomContext } from "../rooms/context.tsx"
import { InventoryItemCard } from "./InventoryItemCard.tsx"
import type { ApiItem } from "./items.ts"
import { RoomItemForm } from "./RoomItemForm.tsx"
import { SearchListLayout } from "./SearchListLayout.tsx"

export function RoomItemList({
	renderItemAction,
}: {
	renderItemAction?: (item: ApiItem) => ReactNode
}) {
	const room = useRoomContext()
	const update = useMutation(api.rooms.update)

	const [items, setItems] = useState(() => Object.values(room.items))
	const [editingItem, setEditingItem] = useState<ApiItem>()
	const [editorOpen, setEditorOpen] = useState(false)

	const handleSearch = (search: string) => {
		const filteredItems = matchSorter(Object.values(room.items), search, {
			keys: ["name", "effect", "flavor", "wealthTier"],
		})
		setItems(filteredItems)
	}

	const handleAdd = async () => {
		setEditingItem({
			_id: crypto.randomUUID(),
			name: "Amazing Shiny Object",
			effect: "It probably does something cool.",
			wealthTier: 3,
		})
		setEditorOpen(true)
	}

	const renderItem = (item: ApiItem) => (
		<li key={item._id} className="flex items-center gap-2">
			<Menu
				render={<InventoryItemCard item={item} />}
				className={"flex-1"}
				providerProps={{
					placement: "right",
				}}
				options={[
					{
						icon: <LucideEdit />,
						label: "Edit",
						onClick: () => {
							setEditingItem(item)
							setEditorOpen(true)
						},
					},
					{
						icon: <LucideCopy />,
						label: "Clone",
						onClick: () => {
							setEditingItem({
								...item,
								_id: crypto.randomUUID(),
								name: `Copy of ${item.name}`,
							})
							setEditorOpen(true)
						},
					},
					{
						icon: <LucideTrash />,
						label: "Delete",
						onClick: () => {
							update({
								roomId: room._id,
								items: {
									[item._id]: null,
								},
							})
						},
					},
				]}
			/>
			{renderItemAction?.(item)}
		</li>
	)

	return (
		<>
			<SearchListLayout
				items={items}
				itemKey="_id"
				renderItem={renderItem}
				onSearch={handleSearch}
				actions={
					<ToastActionForm action={handleAdd}>
						<Button
							type="submit"
							icon={<LucidePackagePlus />}
							appearance="clear"
						>
							<span className="sr-only">Create item</span>
						</Button>
					</ToastActionForm>
				}
			/>
			<Dialog.Root open={editorOpen} setOpen={setEditorOpen}>
				<Dialog.Content title="Edit item">
					{editingItem && (
						<RoomItemForm
							item={editingItem}
							action={async (values) => {
								await update({
									roomId: room._id,
									items: { [editingItem._id]: values },
								})
							}}
						/>
					)}
				</Dialog.Content>
			</Dialog.Root>
		</>
	)
}
