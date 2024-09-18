import * as Lucide from "lucide-react"
import { CharacterAttributeButton } from "./CharacterAttributeButton.tsx"

export function CharacterAttributeButtonRow() {
	return (
		<div className="flex w-full items-center justify-between gap-1">
			<CharacterAttributeButton
				attribute="strength"
				icon={<Lucide.BicepsFlexed />}
			/>
			<CharacterAttributeButton attribute="sense" icon={<Lucide.Eye />} />
			<CharacterAttributeButton attribute="mobility" icon={<Lucide.Wind />} />
			<CharacterAttributeButton
				attribute="intellect"
				icon={<Lucide.Lightbulb />}
			/>
			<CharacterAttributeButton attribute="wit" icon={<Lucide.Sparkle />} />
		</div>
	)
}
