import { Select } from "~/components/Select.tsx"
import { WEALTH_TIERS } from "~/features/characters/constants.ts"
import { FieldAccessor } from "~/features/forms/useForm.ts"

interface WealthTierSelectFieldProps {
	field: FieldAccessor<number>
	label?: string
}

export function WealthTierSelectField({
	field,
	label = "Wealth",
}: WealthTierSelectFieldProps) {
	return (
		<Select
			label={label}
			options={WEALTH_TIERS.map((tier, index) => ({
				value: String(index),
				name: `${index + 1}. ${tier.name}`,
			}))}
			value={String(field.value ?? 0)}
			onChangeValue={(value) => field.set(Number(value))}
		/>
	)
}
