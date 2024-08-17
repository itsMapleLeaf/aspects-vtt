import * as Ariakit from "@ariakit/react"
import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import * as Lucide from "lucide-react"
import React, { startTransition } from "react"
import { Button } from "~/ui/Button.tsx"
import { FormField, FormLayout } from "~/ui/Form.tsx"
import { Input } from "~/ui/Input.tsx"
import { MenuItem, MenuPanel } from "~/ui/Menu.tsx"
import { Modal } from "~/ui/Modal.tsx"
import { NumberInput } from "~/ui/NumberInput.tsx"
import { Panel } from "~/ui/Panel.tsx"
import { TextArea } from "~/ui/TextArea.tsx"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel"
import { useSafeAction, useStableQueryValue } from "../convex/hooks.ts"
import { useRoom } from "../rooms/roomContext.tsx"

type ApiCharacterItem = FunctionReturnType<
	typeof api.items.listByCharacter
>[number]

export function CharacterInventory({
	characterId,
}: {
	characterId: Id<"characters">
}) {
	const characterItems = useQuery(api.items.listByCharacter, {
		characterId,
	})

	return (
		<div className="flex flex-col gap-current">
			<div className="flex gap-current">
				<AddItemCombobox characterId={characterId} />
				<CreateItemButton characterId={characterId} />
			</div>
			<ul className="flex flex-col gap-current">
				{characterItems
					?.toSorted((a, b) =>
						a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
					)
					.map((item) => (
						<li key={item._id}>
							<ItemListItem item={item} characterId={characterId} />
						</li>
					))}
			</ul>
		</div>
	)
}

function AddItemCombobox({ characterId }: { characterId: Id<"characters"> }) {
	const room = useRoom()
	const [search, setSearch] = React.useState("")

	const [roomItems = []] = useStableQueryValue(
		useQuery(api.items.list, {
			roomId: room._id,
			search,
		}),
	)

	const characterItems = useQuery(api.items.listByCharacter, { characterId })

	const addCharacterItem = useMutation(
		api.items.addToCharacter,
	).withOptimisticUpdate((store, { itemId, characterId, quantity }) => {
		let item
		for (const query of store.getAllQueries(api.items.list)) {
			for (const queryItem of query.value ?? []) {
				if (queryItem._id === itemId) {
					item = queryItem
					break
				}
			}
		}

		if (item) {
			store.setQuery(api.items.listByCharacter, { characterId }, [
				...(store.getQuery(api.items.listByCharacter, { characterId }) ?? []),
				{ ...item, quantity: quantity ?? 1 },
			])
		}
	})

	return (
		<Ariakit.ComboboxProvider
			setValue={(value) => {
				startTransition(() => {
					setSearch(value)
				})
			}}
		>
			<Ariakit.Combobox render={<Input placeholder="Add an item..." />} />
			<Ariakit.ComboboxPopover
				className={MenuPanel.style(
					"z-10 max-h-[360px] min-w-[320px] max-w-[640px] overflow-y-auto [transform:translateZ(0)]",
				)}
				gutter={8}
			>
				{roomItems
					.filter((it) =>
						characterItems?.every(
							(characterItem) => characterItem._id !== it._id,
						),
					)
					.toSorted((a, b) =>
						a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
					)
					.map((item) => (
						<Ariakit.ComboboxItem
							key={item._id}
							className={MenuItem.style()}
							setValueOnClick={false}
							onClick={() => {
								addCharacterItem({
									characterId,
									itemId: item._id,
								})
							}}
						>
							{item.name}
						</Ariakit.ComboboxItem>
					))}
			</Ariakit.ComboboxPopover>
		</Ariakit.ComboboxProvider>
	)
}

function CreateItemButton({ characterId }: { characterId: Id<"characters"> }) {
	const room = useRoom()
	const createItem = useMutation(api.items.create)
	const [open, setOpen] = React.useState(false)

	const [, action] = useSafeAction(async (formData: FormData) => {
		await createItem({
			roomId: room._id,
			characterId,
			name: formData.get("name") as string,
			description: formData.get("description") as string,
		})
		setOpen(false)
	})

	return (
		<Modal
			title="Create item"
			open={open}
			onOpenChange={setOpen}
			trigger={<Button icon={<Lucide.PackagePlus />}>Create item</Button>}
		>
			<form action={action}>
				<FormLayout>
					<FormField label="Name">
						<Input name="name" />
					</FormField>
					<FormField label="Description">
						<TextArea name="description" />
					</FormField>
					<Button type="submit" icon={<Lucide.Save />}>
						Create
					</Button>
				</FormLayout>
			</form>
		</Modal>
	)
}

function ItemListItem({
	item,
	characterId,
}: {
	item: ApiCharacterItem
	characterId: Id<"characters">
}) {
	const updateCharacterItem = useMutation(
		api.items.updateCharacterItem,
	).withOptimisticUpdate((store, { itemId, characterId, ...args }) => {
		const data = store.getQuery(api.items.listByCharacter, { characterId })
		if (data) {
			store.setQuery(
				api.items.listByCharacter,
				{ characterId },
				data.map((it) => (it._id === itemId ? { ...it, ...args } : it)),
			)
		}
	})

	const removeCharacterItem = useMutation(
		api.items.removeFromCharacter,
	).withOptimisticUpdate((store, { itemId, characterId }) => {
		const data = store.getQuery(api.items.listByCharacter, { characterId })
		if (data) {
			store.setQuery(
				api.items.listByCharacter,
				{ characterId },
				data.filter((it) => it._id !== itemId),
			)
		}
	})

	return (
		<div className="flex items-center gap-current">
			<Panel className="flex-1 px-3 py-2">
				<h3 className="text-lg/tight">{item.name}</h3>
				<p className="font-medium text-primary-700 empty:hidden">
					{item.description}
				</p>
			</Panel>

			<div className="basis-16 self-stretch">
				<NumberInput
					align="center"
					className="h-full"
					value={item.quantity}
					min={1}
					onChange={(value) => {
						updateCharacterItem({
							characterId,
							itemId: item._id,
							quantity: value,
						})
					}}
				/>
			</div>

			<EditItemButton item={item} />

			<Button
				appearance="clear"
				square
				icon={<Lucide.Trash />}
				className="self-center"
				tooltip="Remove"
				onClick={() => {
					return removeCharacterItem({
						characterId,
						itemId: item._id,
					})
				}}
			/>
		</div>
	)
}

function EditItemButton({ item }: { item: ApiCharacterItem }) {
	const [open, setOpen] = React.useState(false)
	const updateItem = useMutation(api.items.update)

	const [, action] = useSafeAction(async (formData: FormData) => {
		await updateItem({
			itemId: item._id,
			name: formData.get("name") as string,
			description: formData.get("description") as string,
		})
		setOpen(false)
	})

	return (
		<Modal
			title="Edit item"
			open={open}
			onOpenChange={setOpen}
			trigger={
				<Button
					icon={<Lucide.Edit />}
					appearance="clear"
					square
					tooltip="Edit"
				/>
			}
		>
			<form action={action}>
				<FormLayout>
					<FormField label="Name">
						<Input name="name" defaultValue={item.name} />
					</FormField>
					<FormField label="Description">
						<TextArea name="description" defaultValue={item.description} />
					</FormField>
					<Button type="submit" icon={<Lucide.Save />}>
						Save
					</Button>
				</FormLayout>
			</form>
		</Modal>
	)
}
