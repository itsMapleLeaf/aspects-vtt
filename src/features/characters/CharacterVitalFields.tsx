import { useMutation } from "convex/react"
import { useId } from "react"
import { twMerge } from "tailwind-merge"
import { Field } from "~/components/Field.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { api } from "~/convex/_generated/api.js"
import { textInput } from "~/styles/input.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterVitalFields({
	character,
	className,
}: {
	character: Extract<ApiCharacter, { health: number }>
	className?: string
}) {
	const updateCharacter = useMutation(api.characters.update)
	const healthId = useId()
	const resolveId = useId()
	return (
		<div className={twMerge("grid grid-cols-2 gap", className)}>
			<Field label="Health" htmlFor={healthId}>
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
			<Field label="Resolve" htmlFor={resolveId}>
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
