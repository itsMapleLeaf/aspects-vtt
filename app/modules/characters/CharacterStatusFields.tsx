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
			<div className={twMerge("grid grid-flow-col items-center gap-2", className)}>
				<div className="relative flex items-center">
					<CharacterNumberField
						character={character}
						field="damage"
						icon={<LucideHeartCrack className="translate-x-[1px]" />}
						label={null}
						tooltip={`Damage`}
					/>
					<div className="pointer-events-none absolute right-3 opacity-50">/ {damageThreshold}</div>
				</div>
				<div className="relative flex items-center">
					<CharacterNumberField
						character={character}
						field="fatigue"
						icon={<LucideZap className="translate-x-[2px]" />}
						label={null}
						tooltip={`Fatigue`}
					/>
					<div className="pointer-events-none absolute right-3 opacity-50">
						/ {fatigueThreshold}
					</div>
				</div>
				<CharacterNumberField
					character={character}
					field="currency"
					icon={<LucideBanknote />}
					label={null}
					tooltip={`Notes (Currency)`}
				/>
			</div>
		:	null
}
