import { useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { type ReactNode, useState } from "react"
import { api } from "../../../convex/_generated/api.js"
import { Button } from "../../ui/Button.tsx"
import { FormActions, FormLayout, FormRow } from "../../ui/Form.tsx"
import { NumberField } from "../../ui/NumberField.tsx"
import { Select } from "../../ui/Select.tsx"
import type { ApiAttribute, ApiCharacter } from "../characters/types.ts"
import { useCharacters } from "../rooms/roomContext.tsx"
import { useCreateAttributeRollMessage } from "./useCreateAttributeRollMessage.tsx"

export function ContestedRollForm({
	opponent,
	onRoll,
}: { opponent: ApiCharacter; onRoll?: () => void }) {
	const characters = useCharacters()
	const selfCharacter = characters.find((c) => c.isOwner)

	const attributes = useQuery(api.notionImports.functions.get, {})?.attributes
	const strengthAttribute = attributes?.find((a) => a.key === "strength")

	const createAttributeRollMessage = useCreateAttributeRollMessage()

	const [values, setValues] = useState<{
		selfCharacter: ApiCharacter | undefined
		selfAttribute: ApiAttribute | undefined
		selfBoostCount: number
		selfSnagCount: number
		opponentAttribute: ApiAttribute | undefined
		opponentBoostCount: number
		opponentSnagCount: number
	}>({
		selfCharacter,
		selfAttribute: strengthAttribute,
		selfBoostCount: 0,
		selfSnagCount: 0,
		opponentAttribute: strengthAttribute,
		opponentBoostCount: 0,
		opponentSnagCount: 0,
	})

	const setValue = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
		setValues((values) => ({ ...values, [key]: value }))
	}

	return (
		<FormLayout>
			<Select
				label="Character"
				options={characters.map((c) => ({ label: c.displayName, value: c._id }))}
				value={values.selfCharacter?._id}
				placeholder="Choose a character"
				onChange={(id) => {
					const character = characters.find((c) => c._id === id)
					if (character) {
						setValue("selfCharacter", character)
					}
				}}
			/>
			<FormRow>
				<AttributeSelectField
					className="!shrink-0 !basis-56"
					label="Your Attribute"
					value={values.selfAttribute ?? strengthAttribute}
					onChange={(value) => setValue("selfAttribute", value)}
				/>
				<NumberField
					label="Boost Count"
					value={values.selfBoostCount}
					onChange={(value) => setValue("selfBoostCount", value)}
				/>
				<NumberField
					label="Snag Count"
					value={values.selfSnagCount}
					onChange={(value) => setValue("selfSnagCount", value)}
				/>
			</FormRow>
			<FormRow>
				<AttributeSelectField
					className="!shrink-0 !basis-56"
					label="Opponent Attribute"
					value={values.opponentAttribute ?? strengthAttribute}
					onChange={(value) => setValue("opponentAttribute", value)}
				/>
				<NumberField
					label="Boost Count"
					value={values.opponentBoostCount}
					onChange={(value) => setValue("opponentBoostCount", value)}
				/>
				<NumberField
					label="Snag Count"
					value={values.opponentSnagCount}
					onChange={(value) => setValue("opponentSnagCount", value)}
				/>
			</FormRow>
			<FormActions>
				<Button
					text="Roll"
					icon={<Lucide.Dices />}
					onClick={async () => {
						if (!selfCharacter) {
							return
						}
						await Promise.all([
							createAttributeRollMessage({
								content: `<@${selfCharacter._id}> (Defending): ${
									values.selfAttribute?.name ?? "Strength"
								}`,
								attributeValue: selfCharacter[values.selfAttribute?.key ?? "strength"],
								boostCount: values.selfBoostCount,
								snagCount: values.selfSnagCount,
							}),
							createAttributeRollMessage({
								content: `<@${opponent._id}>: ${values.opponentAttribute?.name ?? "Strength"}`,
								attributeValue: opponent[values.opponentAttribute?.key ?? "strength"],
								boostCount: values.opponentBoostCount,
								snagCount: values.opponentSnagCount,
							}),
						])
						onRoll?.()
					}}
				/>
			</FormActions>
		</FormLayout>
	)
}
function AttributeSelectField(props: {
	label: ReactNode
	value: ApiAttribute | undefined
	onChange: (value: ApiAttribute) => void
	className?: string
}) {
	const attributes = useQuery(api.notionImports.functions.get, {})?.attributes
	return (
		<Select
			label={props.label}
			value={props.value?.key}
			options={
				attributes?.map((attribute) => ({ label: attribute.name, value: attribute.key })) ?? []
			}
			placeholder="Select an attribute"
			onChange={(key) => {
				const attribute = attributes?.find((a) => a.key === key)
				if (attribute) props.onChange(attribute)
			}}
			className={props.className}
		/>
	)
}
