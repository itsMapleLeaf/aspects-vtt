import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api.js"
import { useAsyncState } from "../../common/useAsyncState.ts"
import { NumberField } from "../../ui/NumberField.tsx"
import type { ApiAttribute, ApiCharacter } from "./types.ts"

export function CharacterModifierFields({
	character,
	attribute,
}: {
	character: ApiCharacter
	attribute: ApiAttribute["key"]
}) {
	const modifier = character.modifiers?.find((modifier) => modifier.attribute === attribute)
	const [state, update] = useAsyncState(useMutation(api.characters.functions.updateModifier))

	const fields = [
		{ label: "Boost", value: modifier?.boostDice ?? 0, modification: "boostDice" },
		{ label: "Snag", value: modifier?.snagDice ?? 0, modification: "snagDice" },
		{ label: "Attr.", value: modifier?.attributeDice ?? 0, modification: "attributeDice" },
	] as const

	return fields.map((field) => (
		<NumberField
			key={field.label}
			label={field.label}
			value={state.args?.[field.modification] ?? field.value}
			onChange={(value) =>
				update({ characterId: character._id, attribute, [field.modification]: value })
			}
			className="w-12 text-center"
			placeholder={0}
		/>
	))
}
