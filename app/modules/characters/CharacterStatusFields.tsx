import { LucideBanknote, LucideHeart, LucideSun } from "lucide-react"
import { FormField } from "~/ui/Form.tsx"
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
			<>
				<FormField label="Health">
					<div className="relative flex items-center">
						<CharacterNumberField
							character={character}
							field="health"
							icon={<LucideHeart className="translate-x-[1px]" />}
							label={null}
						/>
						<div className="pointer-events-none absolute right-3 opacity-50">
							/ {character.healthMax}
						</div>
					</div>
				</FormField>
				<FormField label="Resolve">
					<div className="relative flex items-center">
						<CharacterNumberField
							character={character}
							field="resolve"
							icon={<LucideSun className="translate-x-[2px]" />}
							label={null}
						/>
						<div className="pointer-events-none absolute right-3 opacity-50">
							/ {character.resolveMax}
						</div>
					</div>
				</FormField>
				<FormField label="Notes">
					<CharacterNumberField
						character={character}
						field="currency"
						icon={<LucideBanknote />}
						label={null}
					/>
				</FormField>
			</>
		:	null
}
