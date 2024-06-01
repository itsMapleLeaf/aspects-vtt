import { LucideBanknote, LucideHeartCrack, LucideZap } from "lucide-react"
import { twMerge } from "tailwind-merge"
import { CharacterNumberField } from "./CharacterNumberField.tsx"
import type { OwnedCharacter } from "./types.ts"

export function CharacterStatusFields({
	character,
	className,
}: {
	character: OwnedCharacter
	className?: string
}) {
	const damageThreshold = character.strength + character.mobility + character.damageThresholdDelta
	const fatigueThreshold =
		character.sense + character.intellect + character.wit + character.fatigueThresholdDelta

	return character.isOwner ?
			<div className={twMerge("grid grid-flow-col items-end gap-2", className)}>
				<CharacterNumberField
					character={character}
					field="damage"
					icon={<LucideHeartCrack className="size-5" />}
					label={`Damage / ${damageThreshold}`}
				/>
				<CharacterNumberField
					character={character}
					field="fatigue"
					icon={<LucideZap className="size-5" />}
					label={`Fatigue / ${fatigueThreshold}`}
				/>
				<CharacterNumberField
					character={character}
					field="currency"
					icon={<LucideBanknote className="size-5" />}
					label={`Notes (Currency)`}
				/>
			</div>
		:	null
}
