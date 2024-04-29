import { useState } from "react"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { wrapContextApi } from "../../common/context.tsx"
import { useCharacters } from "../rooms/roomContext.tsx"

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
