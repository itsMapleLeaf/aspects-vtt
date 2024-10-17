import * as Lucide from "lucide-react"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterAttributeButton } from "./CharacterAttributeButton.tsx"

export function CharacterAttributeButtonRow({
	characters,
}: {
	characters: NormalizedCharacter[]
}) {
	return (
		<div className="flex w-full items-center justify-between gap-1">
			<CharacterAttributeButton
				characters={characters}
				attribute="strength"
				icon={<Lucide.BicepsFlexed />}
			/>
			<CharacterAttributeButton
				characters={characters}
				attribute="sense"
				icon={<Lucide.Eye />}
			/>
			<CharacterAttributeButton
				characters={characters}
				attribute="mobility"
				icon={<Lucide.Wind />}
			/>
			<CharacterAttributeButton
				characters={characters}
				attribute="intellect"
				icon={<Lucide.Lightbulb />}
			/>
			<CharacterAttributeButton
				characters={characters}
				attribute="wit"
				icon={<Lucide.Sparkle />}
			/>
		</div>
	)
}
