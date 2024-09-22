import * as Lucide from "lucide-react"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterAttributeButton } from "./CharacterAttributeButton.tsx"

export function CharacterAttributeButtonRow({
	character,
}: {
	character: NormalizedCharacter
}) {
	return (
		<div className="flex w-full items-center justify-between gap-1">
			<CharacterAttributeButton
				character={character}
				attribute="strength"
				icon={<Lucide.BicepsFlexed />}
			/>
			<CharacterAttributeButton
				character={character}
				attribute="sense"
				icon={<Lucide.Eye />}
			/>
			<CharacterAttributeButton
				character={character}
				attribute="mobility"
				icon={<Lucide.Wind />}
			/>
			<CharacterAttributeButton
				character={character}
				attribute="intellect"
				icon={<Lucide.Lightbulb />}
			/>
			<CharacterAttributeButton
				character={character}
				attribute="wit"
				icon={<Lucide.Sparkle />}
			/>
		</div>
	)
}
