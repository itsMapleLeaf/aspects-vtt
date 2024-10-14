import { Select } from "~/components/Select.tsx"
import { WEALTH_TIERS } from "~/features/characters/constants.ts"

interface WealthTierSelectProps {
	label?: string
	value?: number
	onChange?: (value: number) => void
}

export function WealthTierSelect({
	label = "Wealth",
	value,
	onChange,
}: WealthTierSelectProps) {
	return (
		<Select
			label={label}
			options={WEALTH_TIERS.map((tier, index) => ({
				value: String(index),
				name: `${index + 1}. ${tier.name}`,
			}))}
			value={String(value ?? 0)}
			onChangeValue={(value) => onChange?.(Number(value))}
		/>
	)
}
