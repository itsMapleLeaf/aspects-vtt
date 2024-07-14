import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { type Attribute, listAttributeIds, listAttributes } from "~/modules/attributes/data.ts"
import { CharacterImage } from "~/modules/characters/CharacterImage.tsx"
import { CharacterSearchList } from "~/modules/characters/CharacterSearchList.tsx"
import type { ApiCharacter } from "~/modules/characters/types.ts"
import { useSafeAction } from "~/modules/convex/hooks.ts"
import { useRoom } from "~/modules/rooms/roomContext.tsx"
import { useSceneContext } from "~/modules/scenes/SceneContext.tsx"
import { Button } from "~/ui/Button.tsx"
import { CheckboxField } from "~/ui/CheckboxField.tsx"
import { FormField, FormLayout, FormRow } from "~/ui/Form.tsx"
import { Input } from "~/ui/Input.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "~/ui/Popover.tsx"
import { Select } from "~/ui/Select.tsx"
import { useNumberInput } from "~/ui/useNumberInput.tsx"
import { api } from "../../../convex/_generated/api"

export function CharacterAttackForm({ characters }: { characters: ApiCharacter[] }) {
	const room = useRoom()
	const { tokens } = useSceneContext()

	let attackers = tokens.map((it) => it.character).filter(Boolean)
	if (!room.isOwner) {
		attackers = attackers.filter((it) => it.isOwner)
	}

	const defaultAttacker = attackers.find((it) => it.isOwner) ?? attackers[0]
	const [attacker, setAttacker] = useState(defaultAttacker)

	const [attributeId, setAttributeId] = useState<Attribute["id"]>(() => {
		if (!defaultAttacker) return "strength"
		// use their strongest attribute by default
		return greatestBy(listAttributeIds(), (it) => defaultAttacker[it] ?? 0)
	})

	const boostCountInput = useNumberInput({ defaultValue: 0 })
	const snagCountInput = useNumberInput({ defaultValue: 0 })
	const [pushYourself, setPushYourself] = useState(false)
	const valid = boostCountInput.valid && snagCountInput.valid

	const attack = useMutation(api.characters.functions.attack)
	const updateCharacter = useMutation(api.characters.functions.update)

	const [, action] = useSafeAction(async (_data: FormData) => {
		if (!valid) return
		if (!attacker) return

		if (pushYourself && attacker.resolve != null) {
			await updateCharacter({
				id: attacker._id,
				resolve: attacker.resolve - 2,
			})
		}

		await attack({
			attackerId: attacker._id,
			defenderIds: characters.map((it) => it._id),
			attackerAttribute: attributeId,
			boostCount: boostCountInput.value + (pushYourself ? 1 : 0),
			snagCount: snagCountInput.value,
		})
	})

	const [open, setOpen] = useState(false)

	const attackerIcon =
		attacker ?
			<CharacterImage
				character={attacker}
				className={{ image: "rounded-full object-cover object-top" }}
			/>
		:	<Lucide.UserPlus2 />

	return (
		<form action={action}>
			<FormLayout>
				<FormField label="Attacker" className="items-stretch">
					<Popover placement="bottom-start" open={open} setOpen={setOpen}>
						<PopoverTrigger render={<Button align="start" icon={attackerIcon} />}>
							{attacker ? attacker.name : "Select attacker"}
						</PopoverTrigger>
						<PopoverPanel className="flex w-64 flex-col gap-2 p-2">
							<CharacterSearchList
								characters={attackers}
								onSelect={(character) => {
									setAttacker(character)
									setOpen(false)
								}}
							/>
						</PopoverPanel>
					</Popover>
				</FormField>

				<Select
					label="Attribute"
					options={listAttributes().map((it) => ({
						label: it.name,
						value: it.id,
					}))}
					value={attributeId}
					onChange={setAttributeId}
				/>

				<FormRow>
					<FormField label="Boost dice" className="flex-1">
						<Input {...boostCountInput.props} />
					</FormField>
					<FormField label="Snag dice" className="flex-1">
						<Input {...snagCountInput.props} />
					</FormField>
				</FormRow>

				<CheckboxField
					label="Push yourself"
					checked={pushYourself}
					onChange={(event) => setPushYourself(event.target.checked)}
				/>

				<Button type="submit" icon={<Lucide.Swords />}>
					Attack
					{characters.length > 1 && (
						<>
							{" "}
							<strong>{characters.length}</strong> characters
						</>
					)}
				</Button>
			</FormLayout>
		</form>
	)
}

function greatestBy<T>(items: Iterable<T>, rank: (item: T) => number) {
	return Iterator.from(items).reduce((a, b) => (rank(a) > rank(b) ? a : b))
}
