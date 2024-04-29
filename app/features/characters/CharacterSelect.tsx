import { Select } from "../../ui/Select.old.tsx"
import type { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import type { ResultQueryData } from "../../../convex/resultResponse.ts"

export function CharacterSelect({
	characters,
	selected,
	onChange,
}: {
	characters: ResultQueryData<typeof api.characters.list>
	selected: Id<"characters">
	onChange: (id: Id<"characters">) => void
}) {
	return (
		<Select
			options={characters.map((character) => ({
				value: character._id,
				label: character.displayName,
			}))}
			value={selected}
			onChange={(id) => onChange(id)}
		/>
	)
}
