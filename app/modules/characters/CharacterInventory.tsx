import { useUpdateCharacterMutation } from "~/modules/characters/useUpdateCharacterMutation.tsx"
import { ListInput, ListInputItem } from "../../ui/ListInput.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import type { OwnedApiCharacter } from "./types.ts"

export function CharacterInventory({ character }: { character: OwnedApiCharacter }) {
	const room = useRoom()
	const updateCharacter = useUpdateCharacterMutation(room._id)

	const add = (item: string) => {
		updateCharacter({
			id: character._id,
			inventory: [
				...(character.inventory ?? []),
				{ id: crypto.randomUUID(), name: item, description: "" },
			],
		})
	}

	const remove = (id: string) => {
		updateCharacter({
			id: character._id,
			inventory: character.inventory?.filter((it) => it.id !== id),
		})
	}

	return (
		<ListInput onAdd={add}>
			{character.inventory?.map((it) => (
				<ListInputItem key={it.id} onRemove={() => remove(it.id)}>
					{it.name}
				</ListInputItem>
			))}
		</ListInput>
	)
}
