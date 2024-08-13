import { useMutation } from "convex/react"
import type { ReactNode } from "react"
import { Input } from "~/ui/Input.tsx"
import { useDelayedSyncInput } from "~/ui/useDelayedSyncInput.ts"
import { useControlledNumberInput } from "~/ui/useNumberInput.tsx"
import { api } from "../../../convex/_generated/api"
import { toNearestPositiveInt } from "../../helpers/math.ts"
import { startCase } from "../../helpers/string.ts"
import { FormField } from "../../ui/Form.tsx"
import { CharacterReadOnlyGuard } from "./CharacterReadOnlyGuard.tsx"
import { hasFullCharacterPermissions } from "./helpers.ts"
import type { ApiCharacter, UpdateableCharacterField } from "./types.ts"

export function CharacterNumberField({
	character,
	field,
	label = startCase(field),
	icon,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	tooltip,
}: {
	character: ApiCharacter
	field: UpdateableCharacterField<number>
	label?: ReactNode
	icon?: ReactNode
	min?: number
	max?: number
	tooltip?: string
}) {
	const update = useMutation(api.characters.functions.update)

	const input = useDelayedSyncInput({
		value: String(
			hasFullCharacterPermissions(character) ? character[field] : 0,
		),
		onSubmit: (value) => {
			const int = toNearestPositiveInt(value)
			if (int) {
				update({
					id: character._id,
					[field]: Math.max(int, min),
				})
			}
		},
	})

	const numberInput = useControlledNumberInput({
		min,
		max,
		value: input.value,
		onChangeValue: input.onChange,
	})

	return (
		<CharacterReadOnlyGuard
			character={character}
			label={label}
			value={input.value}
		>
			<FormField label={label}>
				<Input
					{...numberInput.props}
					onBlur={input.onBlur}
					min={min}
					icon={icon}
					tooltip={tooltip}
					className="flex-1"
				/>
			</FormField>
		</CharacterReadOnlyGuard>
	)
}
