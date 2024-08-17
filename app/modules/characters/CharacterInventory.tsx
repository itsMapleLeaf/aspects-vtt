import * as Ariakit from "@ariakit/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import React, { startTransition } from "react"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"
import { MenuItem, MenuPanel } from "~/ui/Menu.tsx"
import { NumberInput } from "~/ui/NumberInput.tsx"
import { Panel } from "~/ui/Panel.tsx"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel"
import { useStableQueryValue } from "../convex/hooks.ts"
import { useRoom } from "../rooms/roomContext.tsx"

export function CharacterInventory({
	characterId,
}: {
	characterId: Id<"characters">
}) {
	const room = useRoom()
	const [search, setSearch] = React.useState("")

	const [roomItems = [], pending] = useStableQueryValue(
		useQuery(api.items.list, {
			roomId: room._id,
			search,
		}),
	)

	const characterItems = useQuery(api.items.listByCharacter, {
		characterId,
	})

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

	const removeCharacterItem = useMutation(
		api.items.removeFromCharacter,
	).withOptimisticUpdate((store, { itemId, characterId }) => {
		const items = store.getQuery(api.items.listByCharacter, {
			characterId,
		})
		if (items) {
			store.setQuery(
				api.items.listByCharacter,
				{ characterId },
				items.filter((it) => it._id !== itemId),
			)
		}
	})

	const updateCharacterItem = useMutation(
		api.items.updateCharacterItem,
	).withOptimisticUpdate((store, { itemId, characterId, ...args }) => {
		const items = store.getQuery(api.items.listByCharacter, {
			characterId,
		})
		if (items) {
			store.setQuery(
				api.items.listByCharacter,
				{ characterId },
				items.map((it) => (it._id === itemId ? { ...it, ...args } : it)),
			)
		}
	})

	return (
		<div className="flex flex-col gap-current">
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
						"max-h-[360px] min-w-[320px] max-w-[640px] overflow-y-auto [transform:translateZ(0)]",
					)}
					gutter={8}
				>
					{roomItems
						.filter((it) =>
							characterItems?.every(
								(characterItem) => characterItem._id !== it._id,
							),
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
			<ul className="flex flex-col gap-current">
				{characterItems
					?.toSorted((a, b) =>
						a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
					)
					.map((item) => (
						<li key={item._id}>
							<div className="flex items-center gap-current">
								<Panel className="flex-1 truncate px-3 py-2">
									<h3>{item.name}</h3>
									<p className="empty:hidden">{item.description}</p>
								</Panel>
								<div className="basis-16">
									<NumberInput
										align="center"
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
								<Button
									appearance="clear"
									square
									icon={<Lucide.Trash />}
									onClick={() => {
										removeCharacterItem({
											characterId,
											itemId: item._id,
										})
									}}
								/>
							</div>
						</li>
					))}
			</ul>
		</div>
	)
}
