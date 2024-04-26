import { useState } from "react"
import { wrapContextApi } from "#app/common/context.js"
import { useCharacters } from "#app/features/rooms/roomContext.js"
import type { Id } from "#convex/_generated/dataModel.js"

export const [CharacterSelectionProvider, useCharacterSelection] = wrapContextApi(
	function useCharacterSelectionProvider() {
		const characters = useCharacters()
		const [selected, setSelected] = useState<Id<"characters">>()
		const selectedCharacter = characters.find((it) => it._id === selected)
		const toggleSelected = (id: Id<"characters">) => {
			setSelected((current) => (current === id ? undefined : id))
		}
		return { selectedCharacter, setSelected, toggleSelected }
	},
)
