import { Select } from "~/components/Select.tsx"
import { WEALTH_TIERS } from "~/features/characters/wealth"

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
			options={WEALTH_TIERS.map((tier, index) => {
				const nextTier = WEALTH_TIERS[index + 1]
				return {
					value: String(index),
					name: `${index + 1}. ${tier.name}`,
					description: (
						<>
							{nextTier ? (
								<p>
									{humanNumber(tier.maxItemPrice)} -{" "}
									{humanNumber(nextTier.maxItemPrice)} notes
								</p>
							) : (
								<p>{humanNumber(tier.maxItemPrice)}+ notes</p>
							)}
							<p>
								{tier.greatestExpense[0]?.toUpperCase() +
									tier.greatestExpense.slice(1).toLowerCase()}
							</p>
						</>
					),
				}
			})}
			value={String(value ?? 0)}
			onChangeValue={(value) => onChange?.(Number(value))}
		/>
	)
}

const humanNumberFormat = new Intl.NumberFormat(undefined, {
	useGrouping: true,
})
function humanNumber(number: number) {
	return humanNumberFormat.format(number)
}
