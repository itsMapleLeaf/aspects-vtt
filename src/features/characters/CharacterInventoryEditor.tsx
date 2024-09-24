import { useMutation } from "convex/react"
import { omit } from "lodash-es"
import {
	LucideCheck,
	LucidePackagePlus,
	LucidePlus,
	LucideTrash,
} from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import { Button } from "~/components/Button.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { Popover } from "~/components/Popover.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { InventoryItemCard } from "~/features/inventory/InventoryItemCard.tsx"
import { RoomItemList } from "~/features/inventory/RoomItemList"
import { SearchListLayout } from "~/features/inventory/SearchListLayout.tsx"
import { useRoomContext } from "~/features/rooms/context.tsx"
import { textInput } from "~/styles/input.ts"
import type { ApiItem } from "../inventory/items.ts"

export function CharacterInventoryEditor({
	character,
}: {
	character: NormalizedCharacter
}) {
	const room = useRoomContext()
	const update = useMutation(api.characters.update)

	const [search, setSearch] = useState("")

	const items = Object.entries(character.inventory ?? {}).flatMap(
		([itemId, overrides]) =>
			room.items[itemId] ? [{ ...room.items[itemId], ...overrides }] : [],
	)

	const filteredItems = matchSorter(items, search, {
		keys: ["name", "effect", "flavor", "wealthTier"],
	})

	const itemIds = new Set(items.map((it) => it._id))

	const itemListAction = (item: ApiItem) => {
		const added = itemIds.has(item._id)
		return (
			<ToastActionForm
				action={async () => {
					await update({
						characterId: character._id,
						inventory: added
							? omit(character.inventory, item._id)
							: { ...character.inventory, [item._id]: added ? null : {} },
					})
				}}
			>
				<Button
					type="submit"
					appearance="clear"
					icon={added ? <LucideCheck /> : <LucidePlus />}
				>
					{added ? (
						<span className="sr-only">Remove {item.name} from inventory</span>
					) : (
						<span className="sr-only">Add {item.name} to inventory</span>
					)}
				</Button>
			</ToastActionForm>
		)
	}

	return (
		<SearchListLayout
			className="p-3 pt-0"
			items={filteredItems}
			renderItem={(item) => (
				<div className="flex items-stretch gap">
					<InventoryItemCard
						className="justify-center"
						key={item._id}
						item={item}
					/>
					<div className="grid w-16 auto-rows-fr gap">
						<NumberInput
							className={textInput("h-full min-h-10")}
							value={item.quantity ?? 1}
							min={1}
							onSubmitValue={async (quantity) => {
								await update({
									characterId: character._id,
									inventory: {
										...character.inventory,
										[item._id]: {
											...character.inventory?.[item._id],
											quantity,
										},
									},
								})
							}}
						/>
						<Button
							icon={<LucideTrash />}
							appearance="solid"
							className="h-full min-h-10"
							onClick={() => {
								update({
									characterId: character._id,
									inventory: omit(character.inventory, item._id),
								})
							}}
						/>
					</div>
				</div>
			)}
			onSearch={setSearch}
			actions={
				<Popover.Root placement="right-start">
					<Popover.Button
						render={<Button appearance="clear" icon={<LucidePackagePlus />} />}
					>
						Add item...
					</Popover.Button>
					<Popover.Content
						className="h-screen max-h-[800px] max-w-md"
						gutter={12}
					>
						<RoomItemList renderItemAction={itemListAction} />
					</Popover.Content>
				</Popover.Root>
			}
		/>
	)
}
