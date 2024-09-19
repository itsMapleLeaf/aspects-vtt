import { useMutation } from "convex/react"
import { useId } from "react"
import { twMerge } from "tailwind-merge"
import { NumberInput } from "~/components/NumberInput.tsx"
import { api } from "~/convex/_generated/api.js"
import { formField } from "~/styles/forms.ts"
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
			<div className={formField()}>
				<label htmlFor={healthId}>Health</label>
				<NumberInput
					id={healthId}
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
			</div>
			<div className={formField()}>
				<label htmlFor={resolveId}>Resolve</label>
				<NumberInput
					id={resolveId}
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
			</div>
		</div>
	)
}
