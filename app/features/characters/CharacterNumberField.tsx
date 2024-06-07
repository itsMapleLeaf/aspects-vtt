import { useMutation } from "convex/react"
import type { ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { api } from "../../../convex/_generated/api"
import { toNearestPositiveInt } from "../../common/numbers.ts"
import { startCase } from "../../common/string.ts"
import { useAsyncState } from "../../common/useAsyncState.ts"
import { FormField } from "../../ui/Form.tsx"
import { NumberInput } from "../../ui/NumberInput.tsx"
import { Tooltip } from "../../ui/Tooltip.tsx"
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

	const inputElement = (
		<NumberInput
			value={value}
			min={min}
			onChange={setValue}
			className={twMerge("flex-1", icon ? "pl-9" : "")}
		/>
	)

	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<FormField label={label}>
				<div className="relative flex items-center">
					<div className="pointer-events-none absolute left-2 opacity-50 *:size-5 empty:hidden">
						{icon}
					</div>
					{tooltip === undefined ?
						inputElement
					:	<Tooltip content={tooltip}>{inputElement}</Tooltip>}
				</div>
			</FormField>
		</CharacterReadOnlyGuard>
	)
}
