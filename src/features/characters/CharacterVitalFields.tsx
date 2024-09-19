import { useMutation } from "convex/react"
import { useId } from "react"
import { twMerge } from "tailwind-merge"
import { FormField } from "~/components/FormField.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { api } from "~/convex/_generated/api.js"
import { textInput } from "~/styles/input.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterVitalFields({
	character,
	className,
}: {
	character: Pick<
		ApiCharacter,
		"_id" | "health" | "resolve" | "healthMax" | "resolveMax"
	>
	className?: string
}) {
	const updateCharacter = useMutation(api.entities.characters.update)
	const healthId = useId()
	const resolveId = useId()
	return (
		<div className={twMerge("grid grid-cols-2 gap", className)}>
			<FormField label="Health" inputId={healthId}>
				<NumberInput
					id={healthId}
					name="health"
					className={textInput()}
					value={character.health}
					max={character.healthMax}
					onSubmitValue={(health) =>
						updateCharacter({
							characterId: character._id,
							health,
						})
					}
				/>
			</FormField>
			<FormField label="Resolve" inputId={resolveId}>
				<NumberInput
					id={resolveId}
					name="resolve"
					className={textInput()}
					value={character.resolve}
					max={character.resolveMax}
					onSubmitValue={(resolve) =>
						updateCharacter({
							characterId: character._id,
							resolve,
						})
					}
				/>
			</FormField>
		</div>
	)
}
