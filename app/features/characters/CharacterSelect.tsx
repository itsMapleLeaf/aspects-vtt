import type { FunctionReturnType } from "convex/server"
import { Select } from "#app/ui/Select.tsx"
import type { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"

export function CharacterSelect({
	characters,
	selected,
	onChange,
}: {
	characters: NonNullable<FunctionReturnType<typeof api.characters.list>["data"]>
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
