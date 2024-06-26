import * as Lucide from "lucide-react"
import { useState, type ReactNode } from "react"
import type { Nullish } from "~/helpers/types.ts"
import { api } from "../../../convex/_generated/api.js"
import { Button } from "../../ui/Button.tsx"
import { FormActions, FormLayout, FormRow } from "../../ui/Form.tsx"
import { NumberField } from "../../ui/NumberField.tsx"
import { Select } from "../../ui/Select.tsx"
import { getAttribute, listAttributes, type Attribute } from "../attributes/data.ts"
import { useMutationAction } from "../convex/hooks.ts"
import { useCharacters, useRoom } from "../rooms/roomContext.tsx"
import { useOwnedCharacter } from "./hooks.ts"
import type { ApiCharacter } from "./types.ts"

export function ContestedRollForm({
	opponent,
	onRoll,
}: {
	opponent: ApiCharacter
	onRoll?: () => void
}) {
	const room = useRoom()
	const characters = useCharacters()
	const selfCharacter = useOwnedCharacter()
	const strengthAttribute = getAttribute("strength")
	const [, rollAttribute] = useMutationAction(api.characters.functions.rollAttribute)

	const [values, setValues] = useState<{
		selfCharacter: Nullish<ApiCharacter>
		selfAttribute: Attribute
		selfBoostCount: number
		selfSnagCount: number
		opponentAttribute: Attribute
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
				options={characters.map((c) => ({
					label: c.name ?? "???",
					value: c._id,
				}))}
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
							rollAttribute({
								characterIds: [selfCharacter._id],
								roomId: room._id,
								attribute: values.selfAttribute.id,
								boostCount: values.selfBoostCount,
								snagCount: values.selfSnagCount,
							}),
							rollAttribute({
								characterIds: [opponent._id],
								roomId: room._id,
								attribute: values.opponentAttribute.id,
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
	value: Attribute | undefined
	onChange: (value: Attribute) => void
	className?: string
}) {
	return (
		<Select
			label={props.label}
			value={props.value?.id}
			options={listAttributes()
				.map((attribute) => ({
					label: attribute.name,
					value: attribute.id,
				}))
				.toArray()
				.sort((a, b) => a.label.localeCompare(b.label))}
			placeholder="Select an attribute"
			onChange={(id) => {
				props.onChange(getAttribute(id))
			}}
			className={props.className}
		/>
	)
}
