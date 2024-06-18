import { useMutation } from "convex/react"
import type { ReactNode } from "react"
import { api } from "../../../convex/_generated/api"
import { toNearestPositiveInt } from "../../helpers/math.ts"
import { useAsyncState } from "../../helpers/react/hooks.ts"
import { startCase } from "../../helpers/string.ts"
import { FormField } from "../../ui/Form.tsx"
import { NumberInput } from "../../ui/NumberInput.tsx"
import { CharacterReadOnlyGuard } from "./CharacterReadOnlyGuard.tsx"
import type { ApiCharacter, UpdateableCharacterField } from "./types.ts"

export function CharacterNumberField({
	character,
	field,
	label = startCase(field),
	icon,
	min = 0,
	tooltip,
}: {
	character: ApiCharacter
	field: UpdateableCharacterField<number>
	label?: ReactNode
	icon?: ReactNode
	min?: number
	tooltip?: string
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.functions.update))
	const value = state.args?.[field] ?? character[field] ?? 0

	function setValue(newValue: number) {
		update({ id: character._id, [field]: toNearestPositiveInt(newValue) })
	}

	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<FormField label={label}>
				<NumberInput
					value={value}
					min={min}
					icon={icon}
					tooltip={tooltip}
					onChange={setValue}
					className="flex-1"
				/>
			</FormField>
		</CharacterReadOnlyGuard>
	)
}
