import { LucideBanknote, LucideHeartCrack, LucideSun } from "lucide-react"
import { twMerge } from "tailwind-merge"
import { CharacterNumberField } from "./CharacterNumberField.tsx"
import { useCharacterUpdatePermission } from "./hooks.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterStatusFields({
	character,
	className,
}: {
	character: ApiCharacter
	className?: string
}) {
	const hasPermission = useCharacterUpdatePermission(character)
	return hasPermission ?
			<div className={twMerge("grid grid-flow-col items-center gap-2", className)}>
				<div className="relative flex items-center">
					<CharacterNumberField
						character={character}
						field="health"
						icon={<LucideHeartCrack className="translate-x-[1px]" />}
						label={null}
						tooltip={`Health`}
					/>
					<div className="pointer-events-none absolute right-3 opacity-50">
						/ {character.healthMax}
					</div>
				</div>
				<div className="relative flex items-center">
					<CharacterNumberField
						character={character}
						field="resolve"
						icon={<LucideSun className="translate-x-[2px]" />}
						label={null}
						tooltip={`Resolve`}
					/>
					<div className="pointer-events-none absolute right-3 opacity-50">
						/ {character.resolveMax}
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
