import { LucideBanknote, LucideHeart, LucideSun } from "lucide-react"
import { FormField } from "~/ui/Form.tsx"
import { CharacterNumberField } from "./CharacterNumberField.tsx"
import { useCharacterUpdatePermission } from "./hooks.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterStatusFields({
	character,
	className,
	notes = true,
	labels = true,
}: {
	character: ApiCharacter
	className?: string
	notes?: boolean
	labels?: boolean
}) {
	const hasPermission = useCharacterUpdatePermission(character)
	return hasPermission ?
			<>
				<FormField
					label={labels ? "Health" : null}
					aria-label={labels ? null : "Health"}
				>
					<div className="relative flex items-center">
						<CharacterNumberField
							character={character}
							field="health"
							max={character.healthMax}
							icon={<LucideHeart className="translate-x-[1px]" />}
							label={null}
						/>
						<div className="pointer-events-none absolute right-3 opacity-50">
							/ {character.healthMax}
						</div>
					</div>
				</FormField>
				<FormField
					label={labels ? "Resolve" : null}
					aria-label={labels ? null : "Resolve"}
				>
					<div className="relative flex items-center">
						<CharacterNumberField
							character={character}
							field="resolve"
							max={character.resolveMax}
							icon={<LucideSun className="translate-x-[2px]" />}
							label={null}
						/>
						<div className="pointer-events-none absolute right-3 opacity-50">
							/ {character.resolveMax}
						</div>
					</div>
				</FormField>
				{notes && (
					<FormField
						label={labels ? "Notes" : null}
						aria-label={labels ? null : "Notes"}
					>
						<CharacterNumberField
							character={character}
							field="currency"
							icon={<LucideBanknote />}
							label={null}
						/>
					</FormField>
				)}
			</>
		:	null
}
