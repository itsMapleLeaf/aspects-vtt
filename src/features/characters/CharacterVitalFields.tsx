import { useMutation } from "convex/react"
import { useId } from "react"
import { twMerge } from "tailwind-merge"
import { Field } from "~/components/Field.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { api } from "~/convex/_generated/api.js"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import { textInput } from "~/styles/input.ts"

export function CharacterVitalFields({
	character,
	className,
}: {
	character: NormalizedCharacter
	className?: string
}) {
	const updateCharacter = useMutation(api.characters.updateMany)
	const healthId = useId()
	const resolveId = useId()
	return (
		<div className={twMerge("grid grid-cols-2 gap", className)}>
			<Field label={`Health / ${character.healthMax}`} htmlFor={healthId}>
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
			</Field>
			<Field label={`Resolve / ${character.resolveMax}`} htmlFor={resolveId}>
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
			</Field>
		</div>
	)
}
