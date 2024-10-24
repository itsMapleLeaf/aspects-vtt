import type { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterAttributeButton } from "./CharacterAttributeButton.tsx"

export function CharacterAttributeButtonRow({
	characters,
}: {
	characters: NormalizedCharacter[]
}) {
	return (
		<div className="flex w-full items-center justify-between gap-1">
			<CharacterAttributeButton characters={characters} attribute="strength" />
			<CharacterAttributeButton characters={characters} attribute="sense" />
			<CharacterAttributeButton characters={characters} attribute="mobility" />
			<CharacterAttributeButton characters={characters} attribute="intellect" />
			<CharacterAttributeButton characters={characters} attribute="wit" />
		</div>
	)
}
