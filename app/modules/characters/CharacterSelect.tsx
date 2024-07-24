import type { FunctionReturnType } from "convex/server"
import type { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { Select } from "../../ui/Select.old.tsx"
import { getCharacterDisplayName } from "./helpers.ts"

export function CharacterSelect({
	characters,
	selected,
	onChange,
}: {
	characters: FunctionReturnType<typeof api.characters.functions.list>
	selected: Id<"characters">
	onChange: (id: Id<"characters">) => void
}) {
	return (
		<Select
			options={characters.map((character) => ({
				value: character._id,
				label: getCharacterDisplayName(character),
			}))}
			value={selected}
			onChange={(id) => onChange(id)}
		/>
	)
}
