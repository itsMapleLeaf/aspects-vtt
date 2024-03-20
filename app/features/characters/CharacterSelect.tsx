import { Select } from "#app/ui/Select.tsx"
import type { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import type { ResultQueryData } from "#convex/resultResponse.js"

export function CharacterSelect({
	characters,
	selected,
	onChange,
}: {
	characters: ResultQueryData<typeof api.characters.list>
	selected: Id<"characters"> | undefined
	onChange: (id: Id<"characters">) => void
}) {
	return characters.length === 0 ? (
		<p className="flex h-10 flex-row items-center px-2 opacity-60">No characters found.</p>
	) : (
		<Select
			options={characters.map((character) => ({
				value: character._id,
				label: character.name,
			}))}
			value={selected}
			onChange={(id) => onChange(id as Id<"characters">)}
		/>
	)
}
